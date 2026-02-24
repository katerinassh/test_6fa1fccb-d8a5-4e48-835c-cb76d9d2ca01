import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampaignReports1771763151914 implements MigrationInterface {
  name = 'CreateCampaignReports1771763151914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "campaign_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "campaign" character varying NOT NULL, "campaign_id" uuid NOT NULL, "adgroup" character varying NOT NULL, "adgroup_id" uuid NOT NULL, "ad" character varying NOT NULL, "ad_id" uuid NOT NULL, "client_id" uuid NOT NULL, "event_name" character varying(50) NOT NULL, "event_time" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d4f9d11076c9b736d3e1473b32f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_eventname_time_ad" ON "campaign_reports" ("event_name", "event_time", "ad_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_event_time_client_id_event_name" ON "campaign_reports" ("event_name", "event_time", "client_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."uq_event_time_client_id_event_name"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_eventname_time_ad"`);
    await queryRunner.query(`DROP TABLE "campaign_reports"`);
  }
}
