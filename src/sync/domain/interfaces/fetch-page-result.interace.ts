import { CampaignReport } from '../../infrastructure/persistence/entities/campaign-report.entity';

export interface FetchPageResult {
  rows: Partial<CampaignReport>[];
  page: number;
  hasMore: boolean;
}
