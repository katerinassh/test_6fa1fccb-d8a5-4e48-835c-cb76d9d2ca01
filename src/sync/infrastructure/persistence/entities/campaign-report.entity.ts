import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'campaign_reports' })
@Index(
  'uq_event_time_client_id_event_name',
  ['eventName', 'eventTime', 'clientId'],
  { unique: true },
)
@Index('idx_eventname_time_ad', ['eventName', 'eventTime', 'adId'])
export class CampaignReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  campaign: string;

  @Column({ type: 'uuid', name: 'campaign_id' })
  campaignId: string;

  @Column({ type: 'varchar' })
  adgroup: string;

  @Column({ type: 'uuid', name: 'adgroup_id' })
  adgroupId: string;

  @Column({ type: 'varchar' })
  ad: string;

  @Column({ type: 'uuid', name: 'ad_id' })
  adId: string;

  @Column({ type: 'uuid', name: 'client_id' })
  clientId: string;

  @Column({ type: 'varchar', length: 50, name: 'event_name' })
  eventName: string;

  @Column({ type: 'timestamptz', name: 'event_time' })
  eventTime: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
  })
  updatedAt: Date;
}
