import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventName } from '../../common/enums/event-name.enum';

export class ReportQueryDto {
  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;

  @IsEnum(EventName, {
    message: `event_name must be one of: ${Object.values(EventName).join(', ')}`,
  })
  event_name: EventName;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsInt()
  @Type(() => Number)
  take: number = 10;
}
