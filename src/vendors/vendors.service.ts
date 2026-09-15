import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { VendorsRepository } from './vendors.repository.js';
import { generateGeohash } from '../utils/geohash.js';

import { CreateVendorDto } from './dto/create-vendor.dto.js';
import { UpdateVendorDto } from './dto/update-vendor.dto.js';

@Injectable()
export class VendorsService {
  constructor(
    private readonly vendorsRepository: VendorsRepository,
  ) {}

  async create(
    createVendorDto: CreateVendorDto,
    userId: number,
  ) {
    const {
      name,
      logoUrl,
      lat,
      lng,
    } = createVendorDto;

    const geoHash = generateGeohash(lat, lng);

    const [vendor] =
      await this.vendorsRepository.create({
        name,
        logo_url: logoUrl,
        lat,
        lng,
        geo_hash: geoHash,
        created_by: userId,
      });

    return vendor;
  }

  async findAll() {
    return await this.vendorsRepository.findAll();
  }

  async findOne(id: number) {
    const [vendor] =
      await this.vendorsRepository.findById(id);

    if (!vendor) {
      throw new NotFoundException(
        'Vendor not found',
      );
    }

    return vendor;
  }

  async update(
    id: number,
    updateVendorDto: UpdateVendorDto,
  ) {
    await this.findOne(id);

    const {
      name,
      logoUrl,
      lat,
      lng,
    } = updateVendorDto;

    let geoHash: string | undefined;

    if (lat !== undefined || lng !== undefined) {
      const current =
        await this.vendorsRepository.findById(id);

      const currentVendor = current[0];

      if (!currentVendor) {
        throw new NotFoundException(
          'Vendor not found',
        );
      }

      const newLat =
        lat ?? currentVendor.lat;

      const newLng =
        lng ?? currentVendor.lng;

      geoHash = generateGeohash(
        newLat,
        newLng,
      );
    }

    const [vendor] =
      await this.vendorsRepository.update(id, {
        ...(name !== undefined && {
          name,
        }),

        ...(logoUrl !== undefined && {
          logo_url: logoUrl,
        }),

        ...(lat !== undefined && {
          lat,
        }),

        ...(lng !== undefined && {
          lng,
        }),

        ...(geoHash !== undefined && {
          geo_hash: geoHash,
        }),
      });

    return vendor;
  }

  async remove(id: number) {
    await this.findOne(id);

    const [vendor] =
      await this.vendorsRepository.delete(id);

    return vendor;
  }
}