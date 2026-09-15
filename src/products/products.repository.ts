import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service.js';
import { NewProducts, products, vendors } from '../database/schema.js';

@Injectable()
export class ProductsRepository {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async create(data: NewProducts) {
    return await this.database.db
      .insert(products)
      .values(data)
      .returning();
  }

  async findAll() {
    return await this.database.db
      .select()
      .from(products);
  }

  async findById(id: number) {
    return await this.database.db
      .select()
      .from(products)
      .where(eq(products.id, id));
  }

  async findByVendor(vendorId: number) {
    return await this.database.db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendorId));
  }

  async update(id: number, data: Partial<NewProducts>) {
    return await this.database.db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
  }

  async delete(id: number) {
    return await this.database.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
  }

  async vendorExists(vendorId: number) {
    const [vendor] = await this.database.db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));

    return !!vendor;
  }
}