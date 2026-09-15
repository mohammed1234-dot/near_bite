import {
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  public readonly db;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle({
      client: this.pool,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}