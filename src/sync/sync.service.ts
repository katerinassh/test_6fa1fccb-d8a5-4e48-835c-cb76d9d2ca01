import { Inject, Injectable } from '@nestjs/common';
import {
  from,
  EMPTY,
  expand,
  map,
  mergeMap,
  bufferCount,
  catchError,
  of,
  retry,
  Observable,
} from 'rxjs';
import { parse } from 'csv-parse/sync';
import { SyncCampaignReportsDto } from './dto/sync-campaign-reports.dto';
import { ConfigService } from '@nestjs/config';
import { EventName, isEventName } from '../common/enums/event-name.enum';
import { SyncGateway } from './sync.gateway';
import { CampaignReport } from './infrastructure/persistence/entities/campaign-report.entity';
import { CAMPAIGN_REPORT_REPOSITORY } from './sync.constants';
import type { AggregatedReportRaw, CampaignReportRepository } from './domain/interfaces/campaign-report-repository.interface';
import { ReportQueryDto } from './dto/report-query.dto';
import { PROBATION_CLIENT_TOKEN } from 'src/probation/probation.constants';
import type { ProbationClient } from 'src/probation/interfaces/probation-client.interface';
import { FetchPageResult } from './domain/interfaces/fetch-page-result.interace';
import { FetchCampaignReports } from '../common/interfaces/fetch-campaign-reports.interface';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CampaignReportMapper } from './infrastructure/mappers/campaign-report.mapper';

@Injectable()
export class SyncService implements SyncGateway {
  private readonly TAKE = 1000;
  private readonly BATCH_SIZE = 2000;
  private readonly eventTypes: EventName[];

  constructor(
    @Inject(PROBATION_CLIENT_TOKEN)
    private readonly probationClient: ProbationClient,

    @Inject(CAMPAIGN_REPORT_REPOSITORY)
    private readonly repository: CampaignReportRepository,

    private readonly configService: ConfigService,
  ) {
    const raw = this.configService.get<string>('SYNC_EVENTS');
    if (!raw) {
      throw new Error('SYNC_EVENTS is not defined in environment');
    }

    this.eventTypes = raw
      .split(',')
      .map((e) => e.trim())
      .filter(isEventName);

    if (this.eventTypes.length === 0) {
      throw new Error('No valid SYNC_EVENTS provided');
    }
  }

  startSync(body: SyncCampaignReportsDto) {
    const chunks = this.generateHourlyChunks(
      new Date(body.from_date),
      new Date(body.to_date),
    );

    return from(this.eventTypes).pipe(
      mergeMap(
        (eventName) =>
          from(chunks).pipe(
            mergeMap(
              (chunk) => this.fetchChunk(chunk.from, chunk.to, eventName),
              1,
            ),
          ),
        2,
      ),
    );
  }

  private generateHourlyChunks(from: Date, to: Date) {
    const chunks: { from: Date; to: Date }[] = [];
    let cursor = new Date(from);

    while (cursor < to) {
      const next = new Date(cursor);
      next.setHours(next.getHours() + 1);

      chunks.push({
        from: new Date(cursor),
        to: next > to ? to : next,
      });

      cursor = next;
    }

    return chunks;
  }

  private fetchChunk(fromDate: Date, toDate: Date, eventName: EventName) {
    return this.fetchPage(fromDate, toDate, eventName).pipe(
      expand((response) => {
        if (response.hasMore) {
          return this.fetchPage(fromDate, toDate, eventName, response.page + 1);
        }
        return EMPTY;
      }),
      mergeMap((response) => from(response.rows)),
      bufferCount(this.BATCH_SIZE),
      mergeMap((batch) => this.upsertBatch(batch), 2),
    );
  }

  private fetchPage(
    from: Date,
    to: Date,
    event_name: EventName,
    page?: number,
  ): Observable<FetchPageResult> {
    const params: FetchCampaignReports = {
      from_date: this.formatIsoToSimple(from),
      to_date: this.formatIsoToSimple(to),
      event_name,
      take: this.TAKE,
    };

    if (page) {
      params.page = page;
    }

    return this.probationClient.fetchCampaignReports(params).pipe(
      retry({ count: 3, delay: 1000 }),

      map((csv: string) => {
        try {
          const rows = parse(csv, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          });
          return {
            rows: rows.map(this.transformRow),
            page: page ?? 1,
            hasMore: rows.length === this.TAKE,
          };
        } catch (err) {
          console.error('CSV parse error:', err);
          return {
            rows: [],
            page: page ?? 1,
            hasMore: false,
          };
        }
      }),

      catchError((err) => {
        console.error('Fetch page error:', err);
        return of({
          rows: [],
          page: page ?? 1,
          hasMore: false,
        });
      }),
    );
  }

  private async upsertBatch(batch: Partial<CampaignReport>[]) {
    if (!batch.length) return;

    try {
      await this.repository.upsertBatch(batch);
    } catch (err) {
      console.error('Upsert batch error:', {
        error: err,
        batchSize: batch.length,
      });
      throw err;
    }
  }

  private transformRow(row: any): Partial<CampaignReport> {
    return {
      campaign: row.campaign,
      campaignId: row.campaign_id,
      adgroup: row.adgroup,
      adgroupId: row.adgroup_id,
      ad: row.ad,
      adId: row.ad_id,
      clientId: row.client_id,
      eventName: row.event_name,
      eventTime: new Date(row.event_time + 'Z'),
    };
  }

  private formatIsoToSimple(date: Date): string {
    return date.toISOString().replace('T', ' ').split('.')[0];
  }

  async getAggregatedReports(query: ReportQueryDto): Promise<PaginatedResult<AggregatedReportRaw>> {
    const results = await this.repository.findAggregatedWithCursor(query);

    return CampaignReportMapper.toPageDto(results, 'next_cursor');
  }
}
