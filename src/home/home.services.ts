import { Injectable } from '@nestjs/common';
import { VendorsRepository } from '../vendors/vendors.repository.js';
import { UsersRepository } from '../users/users.repository.js'; // adjust path/name
import { HomeQueryDto } from '../home/dto/home-query.dto.js';
import { generateGeohash, getGeohashNeighbors } from '../utils/geohash.js';
import { haversineMeters } from '../utils/haversine.js';
@Injectable()
export class HomeService {
  constructor(
    private readonly vendorsRepository: VendorsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getHome(userId: number, query: HomeQueryDto) {
    let { lat, lng, radius = 3000, limit = 20, cursor } = query;

    if (lat === undefined || lng === undefined) {
      const [user] = await this.usersRepository.findById(userId);
      lat = lat ?? user.lat;
      lng = lng ?? user.lng;
    }

    const precision =
      radius <= 1000 ? 7 :
      radius <= 5000 ? 6 :
      radius <= 20000 ? 5 : 4;

    const centerHash = generateGeohash(lat, lng, precision);
    const candidateHashes = [centerHash, ...getGeohashNeighbors(centerHash)];

    const candidates = await this.vendorsRepository.findByGeohashes(candidateHashes);

    const withDistance = candidates
      .map((v) => ({ ...v, distanceMeters: haversineMeters(lat, lng, v.lat, v.lng) }))
      .filter((v) => v.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const startIndex = cursor
      ? withDistance.findIndex((v) => v.id === Number(cursor)) + 1
      : 0;

    const page = withDistance.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < withDistance.length ? String(page[page.length - 1].id) : null;

    return { vendors: page, nextCursor };
  }
}