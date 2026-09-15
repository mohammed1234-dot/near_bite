import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service.js';
import {
  products,
  vendors,
} from '../database/schema.js';

import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      vendorId,
      name,
      price,
      description,
    } = createProductDto;

    // Make sure the vendor exists
    const [vendor] = await this.database.db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const [product] = await this.database.db
      .insert(products)
      .values({
        vendorId,
        name,
        price,
        description,
      })
      .returning();

    return product;
  }

  async findAll() {
    return await this.database.db
      .select()
      .from(products);
  }

  async findOne(id: number) {
    const [product] = await this.database.db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByVendor(vendorId: number) {
    return await this.database.db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendorId));
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ) {
    await this.findOne(id);

    const {
      vendorId,
      name,
      price,
      description,
    } = updateProductDto;

    // If vendorId is being changed,
    // make sure the new vendor exists.
    if (vendorId !== undefined) {
      const [vendor] = await this.database.db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }
    }

    const updateData: Partial<
      typeof products.$inferInsert
    > = {};

    if (vendorId !== undefined) {
      updateData.vendorId = vendorId;
    }

    if (name !== undefined) {
      updateData.name = name;
    }

    if (price !== undefined) {
      updateData.price = price;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const [product] = await this.database.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    const [product] = await this.database.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    return product;
  }
}