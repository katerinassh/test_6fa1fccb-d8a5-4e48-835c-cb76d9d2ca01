import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProbationApiClient } from './infrastructure/http/probation-api.client';
import { PROBATION_CLIENT_TOKEN } from './probation.constants';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.getOrThrow<string>('PROBATION_API_URL'),
        timeout: 10000,
        headers: {
          'x-api-key': config.getOrThrow<string>('PROBATION_API_KEY'),
          'Content-Type': 'application/json',
        },
      }),
    }),
  ],
  providers: [
    {
      provide: PROBATION_CLIENT_TOKEN,
      useClass: ProbationApiClient,
    },
  ],
  exports: [PROBATION_CLIENT_TOKEN],
})
export class ProbationModule {}
