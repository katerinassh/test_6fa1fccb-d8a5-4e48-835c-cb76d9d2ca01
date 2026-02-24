import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CampaignReport } from './entities/campaign-report.entity';
import { Repository } from 'typeorm';
import {
  AggregatedReportRaw,
  CampaignReportRepository,
} from '../../domain/interfaces/campaign-report-repository.interface';
import { ReportQueryDto } from '../../dto/report-query.dto';
import { CampaignReportMapper } from '../mappers/campaign-report.mapper';

@Injectable()
export class TypeOrmCampaignReportRepository implements CampaignReportRepository {
  constructor(
    @InjectRepository(CampaignReport)
    private readonly repository: Repository<CampaignReport>,
  ) {}

  async upsertBatch(batch: Partial<CampaignReport>[]) {
    if (!batch.length) return;

    await this.repository.upsert(batch, {
      conflictPaths: ['eventName', 'eventTime', 'clientId'],
    });
  }

  async findAggregatedWithCursor(
    query: ReportQueryDto,
  ): Promise<AggregatedReportRaw[]> {
    const { from_date, to_date, event_name, take, cursor } = query;

    const dateExpression = `(report.event_time AT TIME ZONE 'UTC')::date`;
    const cursorExpression = `CONCAT(${dateExpression}::text, '_', report.ad_id::text)`;
    const adIdExpression = `"report"."ad_id"`;

    const qb = this.repository
      .createQueryBuilder('report')
      .select(adIdExpression, 'ad_id')
      .addSelect(dateExpression, 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect(cursorExpression, 'next_cursor')
      .where('report.eventName = :event_name', { event_name })
      .andWhere('report.eventTime BETWEEN :from_date AND :to_date', {
        from_date,
        to_date,
      });

    if (cursor) {
      qb.andWhere(`${cursorExpression} > :cursor`, { cursor });
    }

    const results = await qb
      .groupBy(adIdExpression)
      .addGroupBy(dateExpression)
      .addGroupBy(cursorExpression)
      .orderBy('date', 'ASC')
      .addOrderBy(adIdExpression, 'ASC')
      .limit(take)
      .getRawMany();

    return CampaignReportMapper.toAggregatedDomainArray(results);
  }
}
