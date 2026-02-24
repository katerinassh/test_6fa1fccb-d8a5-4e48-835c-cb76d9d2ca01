import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
import { ProbationClient } from '../../interfaces/probation-client.interface';
import { FetchCampaignReports } from '../../../common/interfaces/fetch-campaign-reports.interface';

@Injectable()
export class ProbationApiClient implements ProbationClient {
  constructor(private readonly http: HttpService) {}

  fetchCampaignReports(params: FetchCampaignReports) {
    return this.http
      .get('/tasks/campaign/reports', { params })
      .pipe(map((res) => res.data.data.csv));
  }
}
