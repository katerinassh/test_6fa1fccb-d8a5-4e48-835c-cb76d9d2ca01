import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, throwError } from 'rxjs';
import { ProbationClient } from '../../interfaces/probation-client.interface';
import { FetchCampaignReports } from '../../../common/interfaces/fetch-campaign-reports.interface';

@Injectable()
export class ProbationApiClient implements ProbationClient {
  private readonly logger = new Logger(ProbationApiClient.name);

  constructor(private readonly http: HttpService) {}

  fetchCampaignReports(params: FetchCampaignReports) {
    this.logger.debug(`Requesting Probation API with params: ${JSON.stringify(params)}`);
  
    return this.http.get('/tasks/campaign/reports', { params }).pipe(
      map((res) => res.data.data.csv),
      catchError((error) => {
        this.logger.error(`Failed to fetch reports: ${error.message}`);
        
        return throwError(() => error);
      })
    );
  }
}
