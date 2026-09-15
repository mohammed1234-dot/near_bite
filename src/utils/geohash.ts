import ngeohash from 'ngeohash';

export function generateGeohash(
  lat: number,
  lng: number,
  precision = 6,
): string {
  return ngeohash.encode(lat, lng, precision);
}

export function getGeohashNeighbors(geohash: string): string[] {
  return ngeohash.neighbors(geohash);
}