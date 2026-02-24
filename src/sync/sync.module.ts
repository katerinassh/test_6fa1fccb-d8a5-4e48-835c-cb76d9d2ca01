import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { ProbationModule } from '../probation/probation.module';
import { CampaignReport } from './infrastructure/persistence/entities/campaign-report.entity';
import { SYNC_GATEWAY_TOKEN } from './sync.gateway';
import { CAMPAIGN_REPORT_REPOSITORY } from './sync.constants';
import { TypeOrmCampaignReportRepository } from './infrastructure/persistence/typeorm-campaign-report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignReport]), ProbationModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    {
      provide: SYNC_GATEWAY_TOKEN,
      useExisting: SyncService,
    },
    {
      provide: CAMPAIGN_REPORT_REPOSITORY,
      useClass: TypeOrmCampaignReportRepository,
    },
  ],
})
export class SyncModule {}
