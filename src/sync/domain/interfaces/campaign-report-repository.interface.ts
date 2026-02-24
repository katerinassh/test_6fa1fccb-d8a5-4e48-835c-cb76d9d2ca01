import { ReportQueryDto } from '../../dto/report-query.dto';
import { CampaignReport } from '../../infrastructure/persistence/entities/campaign-report.entity';

export interface AggregatedReportRaw {
  ad_id: number;
  date: string;
  count: number;
  next_cursor: string;
}

export interface CampaignReportRepository {
  upsertBatch(batch: Partial<CampaignReport>[]): Promise<void>;
  findAggregatedWithCursor(
    quert: ReportQueryDto,
  ): Promise<AggregatedReportRaw[]>;
}
