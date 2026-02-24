import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { AggregatedReportRaw } from '../../domain/interfaces/campaign-report-repository.interface';

export class CampaignReportMapper {
  static toAggregatedDomain(raw: any): AggregatedReportRaw {
    return {
      ad_id: raw.ad_id,
      date:
        raw.date instanceof Date
          ? raw.date.toISOString().split('T')[0]
          : raw.date,
      count: Number(raw.count),
      next_cursor: raw.next_cursor,
    };
  }

  static toAggregatedDomainArray(rawArray: any[]): AggregatedReportRaw[] {
    return rawArray.map((raw) => this.toAggregatedDomain(raw));
  }

  static toPageDto<T>(
    data: T[], 
    cursorField: keyof T,
  ): PaginatedResult<T> {
    const lastItem = data[data.length - 1];
    
    return {
      data,
      nextCursor: lastItem ? (lastItem[cursorField] as unknown as string) : null,
    };
  }
}
