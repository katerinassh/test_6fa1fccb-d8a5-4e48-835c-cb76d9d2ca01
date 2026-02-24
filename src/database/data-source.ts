import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { getTypeOrmConfig } from './typeorm.config';

dotenv.config();

export const AppDataSource = new DataSource(getTypeOrmConfig());
