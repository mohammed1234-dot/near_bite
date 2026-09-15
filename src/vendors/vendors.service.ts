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
 
async create(createVendorDto: CreateVendorDto) {
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

async update(id: number, updateVendorDto: UpdateVendorDto) {
  await this.findOne(id);
  const { name, logoUrl, lat, lng } = updateVendorDto;
  const updateData: Partial<typeof updateVendorDto> = {};
  if (name !== undefined) updateData.name = name;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (lat !== undefined) updateData.lat = lat;
  if (lng !== undefined) updateData.lng = lng;

  let geoHash: string | undefined;
  if (lat !== undefined || lng !== undefined) {
    const current = await this.vendorsRepository.findById(id);
    const newLat = lat ?? current[0].lat;
    const newLng = lng ?? current[0].lng;
    geoHash = generateGeohash(newLat, newLng);
  }

  const [vendor] = await this.vendorsRepository.update(id, {
    name: updateData.name,
    logo_url: updateData.logoUrl,
    lat: updateData.lat,
    lng: updateData.lng,
    ...(geoHash && { geo_hash: geoHash }),
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