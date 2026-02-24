import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class SyncCampaignReportsDto {
  @Type(() => Date)
  @IsDate()
  from_date: Date;

  @Type(() => Date)
  @IsDate()
  to_date: Date;
}
