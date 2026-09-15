import { Injectable } from '@nestjs/common';
import { eq ,inArray} from 'drizzle-orm';

import { DatabaseService } from '../database/database.service.js';
import { NewVendors, vendors } from '../database/schema.js';

@Injectable()
export class VendorsRepository {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async create(data: NewVendors) {
    return await this.database.db
      .insert(vendors)
      .values(data)
      .returning();
  }

  async findAll() {
    return await this.database.db
      .select()
      .from(vendors);
  }
  async findByGeohashes(geoHashes: string[]) {
  return await this.database.db
    .select()
    .from(vendors)
    .where(inArray(vendors.geo_hash, geoHashes));
}

  async findById(id: number) {
    return await this.database.db
      .select()
      .from(vendors)
      .where(eq(vendors.id, id));
  }

  async update(
    id: number,
    data: Partial<NewVendors>,
  ) {
    return await this.database.db
      .update(vendors)
      .set(data)
      .where(eq(vendors.id, id))
      .returning();
  }

  async delete(id: number) {
    return await this.database.db
      .delete(vendors)
      .where(eq(vendors.id, id))
      .returning();
  }
}