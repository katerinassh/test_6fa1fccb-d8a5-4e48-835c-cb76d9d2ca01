import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAggregatedReportsIndex1771951712171 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "idx_campaign_reports_agg" 
      ON "campaign_reports" (
          "event_name", 
          (( "event_time" AT TIME ZONE 'UTC' )::date), 
          "ad_id"
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_campaign_reports_agg";`);
  }
}
