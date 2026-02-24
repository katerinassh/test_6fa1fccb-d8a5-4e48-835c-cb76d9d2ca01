import { Observable } from 'rxjs';
import { SyncCampaignReportsDto } from './dto/sync-campaign-reports.dto';
import { ReportQueryDto } from './dto/report-query.dto';

export interface SyncGateway {
  startSync(body: SyncCampaignReportsDto): Observable<void>;
  getAggregatedReports(query: ReportQueryDto);
}

export const SYNC_GATEWAY_TOKEN = Symbol('SYNC_GATEWAY_TOKEN');
