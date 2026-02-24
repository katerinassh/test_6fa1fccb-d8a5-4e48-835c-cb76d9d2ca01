import { EventName } from '../enums/event-name.enum';

export interface FetchCampaignReports {
  from_date: string;
  to_date: string;
  event_name: EventName;
  take?: number;
  page?: number;
}
