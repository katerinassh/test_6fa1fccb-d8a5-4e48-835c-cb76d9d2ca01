import { Observable } from 'rxjs';
import { FetchCampaignReports } from '../../common/interfaces/fetch-campaign-reports.interface';

export interface ProbationClient {
  fetchCampaignReports(params: FetchCampaignReports): Observable<string>;
}
