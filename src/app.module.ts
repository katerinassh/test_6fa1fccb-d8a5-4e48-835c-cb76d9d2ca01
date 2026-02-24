import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './database/typeorm.config';
import { SyncModule } from './sync/sync.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => getTypeOrmConfig(),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SyncModule,
  ],
})
export class AppModule {}
