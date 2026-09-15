import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProductsRepository } from './products.repository.js';
import { NewProducts } from '../database/schema.js';

import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      vendorId,
      name,
      price,
      description,
    } = createProductDto;

    // Make sure the vendor exists
    const vendorExists = await this.productsRepository.vendorExists(vendorId);
    if (!vendorExists) {
      throw new NotFoundException('Vendor not found');
    }

    const [product] = await this.productsRepository.create({
      vendorId,
      name,
      price,
      description,
    });

    return product;
  }

  async findAll() {
    return await this.productsRepository.findAll();
  }

  async findOne(id: number) {
    const [product] = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByVendor(vendorId: number) {
    return await this.productsRepository.findByVendor(vendorId);
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

    // If vendorId is being changed, make sure the new vendor exists.
    if (vendorId !== undefined) {
      const vendorExists = await this.productsRepository.vendorExists(vendorId);
      if (!vendorExists) {
        throw new NotFoundException('Vendor not found');
      }
    }

    const updateData: Partial<NewProducts> = {};

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

    const [product] = await this.productsRepository.update(id, updateData);

    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    const [product] = await this.productsRepository.delete(id);

    return product;
  }
}