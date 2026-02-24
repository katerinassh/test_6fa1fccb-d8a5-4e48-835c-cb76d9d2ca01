import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { SyncCampaignReportsDto } from './dto/sync-campaign-reports.dto';
import { ReportQueryDto } from './dto/report-query.dto';

import { SYNC_GATEWAY_TOKEN, type SyncGateway } from './sync.gateway';

@Controller('sync')
export class SyncController {
  constructor(
    @Inject(SYNC_GATEWAY_TOKEN) private readonly syncGateway: SyncGateway,
  ) {}

  @Post('campaign-reports')
  @HttpCode(HttpStatus.OK)
  async sync(@Body() body: SyncCampaignReportsDto) {
    this.syncGateway.startSync(body).subscribe();
    return { status: 'sync started' };
  }

  @Get('campaign-reports')
  async getCampaignReports(@Query() query: ReportQueryDto) {
    const result = await this.syncGateway.getAggregatedReports(query);

    return {
      success: true,
      data: result.data,
      pagination: {
        next_cursor: result.nextCursor,
        take: query.take,
        has_more: !!result.nextCursor,
      },
    };
  }
}
