import 'dotenv/config';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

import { users, vendors, products } from './schema.js';
import { generateGeohash } from '../utils/geohash.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({
  client: pool,
});

// ======================================================
// CONFIG
// ======================================================

const CITIES = [
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  { name: 'Giza', lat: 30.0131, lng: 31.2089 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Amman', lat: 31.9454, lng: 35.9284 },
];

// ======================================================
// RANDOM HELPERS
// ======================================================

function randomInt(min: number, max: number) {
  return Math.floor(
    Math.random() * (max - min + 1),
  ) + min;
}

function pickCity() {
  return CITIES[
    Math.floor(Math.random() * CITIES.length)
  ];
}

function randomPointNear(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
) {
  const radiusInDegrees =
    radiusMeters / 111_320;

  const u = Math.random();
  const v = Math.random();

  const w =
    radiusInDegrees * Math.sqrt(u);

  const t =
    2 * Math.PI * v;

  const dx =
    w * Math.cos(t);

  const dy =
    w * Math.sin(t);

  return {
    lat: centerLat + dy,

    lng:
      centerLng +
      dx /
        Math.cos(
          (centerLat * Math.PI) / 180,
        ),
  };
}

function pickRandom<T>(arr: T[]): T {
  return arr[
    Math.floor(Math.random() * arr.length)
  ];
}

// ======================================================
// SEED CONFIGURATION
// ======================================================

const CITY_CENTER = pickCity();

const CLUSTER_RADIUS_METERS = randomInt(
  1500,
  6000,
);

const VENDOR_COUNT = randomInt(
  8,
  20,
);

const FAR_VENDOR_COUNT = randomInt(
  1,
  3,
);

// ======================================================
// VENDOR NAMES
// ======================================================

const NAME_PREFIXES = [
  'Koshary',
  'Zooba',
  'Abou',
  'El',
  'Sequoia',
  'Felfela',
  'Al',
  'Om',
  'Wady',
  'Nile',
  'Kebda',
  'Morgan',
  'Hosny',
  'Ali',
  'Cairo',
];

const NAME_SUFFIXES = [
  'El Tahrir',
  'Zamalek',
  'Tarek',
  'Kitchen',
  'House',
  'Grill',
  'Corner',
  'Express',
  'Bites',
  'Deli',
  'Cafe',
  'Diner',
  'Spot',
  'Street Food',
];

function randomVendorName(
  used: Set<string>,
): string {
  let name: string;

  do {
    name =
      `${pickRandom(NAME_PREFIXES)} ` +
      `${pickRandom(NAME_SUFFIXES)}`;
  } while (used.has(name));

  used.add(name);

  return name;
}

// ======================================================
// PRODUCTS
// ======================================================

const PRODUCT_POOL = [
  {
    name: 'Koshary (Large)',
    price: 4500,
    description:
      'Rice, lentils, pasta, fried onions, spicy tomato sauce',
  },

  {
    name: 'Koshary (Small)',
    price: 3000,
    description:
      'Same classic, smaller portion',
  },

  {
    name: 'Taameya Sandwich',
    price: 2500,
    description:
      'Egyptian falafel in baladi bread',
  },

  {
    name: 'Hawawshi',
    price: 5500,
    description:
      'Spiced minced meat baked in bread',
  },

  {
    name: 'Rice Pudding',
    price: 2000,
    description:
      'Classic Egyptian dessert',
  },

  {
    name: 'Molokhia Bowl',
    price: 6000,
    description:
      'Jute leaf stew with rice and chicken',
  },

  {
    name: 'Shawarma Plate',
    price: 7000,
    description:
      'Grilled shawarma with rice and salad',
  },

  {
    name: 'Feteer Meshaltet',
    price: 4000,
    description:
      'Flaky layered Egyptian pastry',
  },

  {
    name: 'Grilled Kofta',
    price: 8000,
    description:
      'Spiced minced meat skewers, grilled',
  },

  {
    name: 'Fresh Juice',
    price: 1500,
    description:
      'Seasonal fruit, pressed fresh',
  },
];

function randomProducts() {
  const count = randomInt(1, 3);

  const shuffled = [
    ...PRODUCT_POOL,
  ].sort(
    () => Math.random() - 0.5,
  );

  return shuffled.slice(
    0,
    count,
  );
}

// ======================================================
// SEED
// ======================================================

async function seed() {
  console.log(
    'Seeding NearBite database...',
  );

  console.log(
    `  city: ${CITY_CENTER.name} | ` +
    `cluster radius: ${CLUSTER_RADIUS_METERS}m | ` +
    `vendors: ${VENDOR_COUNT} | ` +
    `far vendors: ${FAR_VENDOR_COUNT}`,
  );

  // ====================================================
  // ADMIN
  // ====================================================

  const adminPasswordHash =
    await bcrypt.hash(
      'Passw0rd!',
      12,
    );

  let admin = (
    await db
      .select()
      .from(users)
      .where(
        eq(
          users.email,
          'admin@nearbite.com',
        ),
      )
      .limit(1)
  )[0];

  if (!admin) {
    [admin] = await db
      .insert(users)
      .values({
        name: 'Seed Admin',

        email:
          'admin@nearbite.com',

        password_hash:
          adminPasswordHash,

        role: 'admin',

        lat:
          CITY_CENTER.lat,

        lng:
          CITY_CENTER.lng,
      })
      .returning();

    console.log(
      `  admin created: ${admin.email}`,
    );
  } else {
    console.log(
      `  admin already exists: ${admin.email}`,
    );
  }

  // ====================================================
  // CUSTOMER
  // ====================================================

  const customerLocation =
    randomPointNear(
      CITY_CENTER.lat,
      CITY_CENTER.lng,
      CLUSTER_RADIUS_METERS / 2,
    );

  const customerPasswordHash =
    await bcrypt.hash(
      'Passw0rd!',
      12,
    );

  let customer = (
    await db
      .select()
      .from(users)
      .where(
        eq(
          users.email,
          'customer@nearbite.com',
        ),
      )
      .limit(1)
  )[0];

  if (!customer) {
    [customer] = await db
      .insert(users)
      .values({
        name: 'Seed Customer',

        email:
          'customer@nearbite.com',

        password_hash:
          customerPasswordHash,

        role: 'customer',

        lat:
          customerLocation.lat,

        lng:
          customerLocation.lng,
      })
      .returning();

    console.log(
      `  customer created: ${customer.email} @ ` +
      `(${customerLocation.lat.toFixed(4)}, ` +
      `${customerLocation.lng.toFixed(4)})`,
    );
  } else {
    console.log(
      `  customer already exists: ${customer.email} @ ` +
      `(${customer.lat.toFixed(4)}, ` +
      `${customer.lng.toFixed(4)})`,
    );
  }

  // ====================================================
  // VENDORS
  // ====================================================

  const usedNames =
    new Set<string>();

  const createdVendors:
    (typeof vendors.$inferSelect)[] =
    [];

  // ====================================================
  // NEARBY VENDORS
  // ====================================================

  for (
    let i = 0;
    i < VENDOR_COUNT;
    i++
  ) {
    const {
      lat,
      lng,
    } = randomPointNear(
      CITY_CENTER.lat,
      CITY_CENTER.lng,
      CLUSTER_RADIUS_METERS,
    );

    const name =
      randomVendorName(
        usedNames,
      );

    const geo_hash =
      generateGeohash(
        lat,
        lng,
      );

    const [vendor] =
      await db
        .insert(vendors)
        .values({
          name,

          logo_url:
            `https://placehold.co/150x150?text=${encodeURIComponent(name)}`,

          lat,

          lng,

          geo_hash,

          created_by:
            admin.id,
        })
        .returning();

    createdVendors.push(
      vendor,
    );

    console.log(
      `  vendor created: ${vendor.name} ` +
      `(${lat.toFixed(4)}, ` +
      `${lng.toFixed(4)}, ` +
      `geohash: ${geo_hash})`,
    );
  }

  // ====================================================
  // FAR VENDORS
  // ====================================================

  for (
    let i = 0;
    i < FAR_VENDOR_COUNT;
    i++
  ) {
    // 50km - 150km away
    const farRadius =
      randomInt(
        50_000,
        150_000,
      );

    const angle =
      Math.random() *
      2 *
      Math.PI;

    const farLat =
      CITY_CENTER.lat +
      (farRadius / 111_320) *
      Math.cos(angle);

    const farLng =
      CITY_CENTER.lng +
      (farRadius / 111_320) *
      Math.sin(angle) /
      Math.cos(
        (CITY_CENTER.lat *
          Math.PI) /
          180,
      );

    const name =
      randomVendorName(
        usedNames,
      ) + ' (Far)';

    const geo_hash =
      generateGeohash(
        farLat,
        farLng,
      );

    const [vendor] =
      await db
        .insert(vendors)
        .values({
          name,

          logo_url:
            `https://placehold.co/150x150?text=Far`,

          lat:
            farLat,

          lng:
            farLng,

          geo_hash,

          created_by:
            admin.id,
        })
        .returning();

    createdVendors.push(
      vendor,
    );

    console.log(
      `  far vendor created: ${vendor.name} ` +
      `(${farLat.toFixed(4)}, ` +
      `${farLng.toFixed(4)}) ` +
      `— should NOT appear in a nearby /home search`,
    );
  }

  // ====================================================
  // PRODUCTS
  // ====================================================

  for (
    const vendor of createdVendors
  ) {
    const items =
      randomProducts();

    for (
      const item of items
    ) {
      await db
        .insert(products)
        .values({
          vendorId:
            vendor.id,

          name:
            item.name,

          price:
            item.price,

          description:
            item.description,
        });
    }

    console.log(
      `  ${items.length} product(s) added ` +
      `for ${vendor.name}`,
    );
  }

  // ====================================================
  // DONE
  // ====================================================

  console.log(
    'Seed complete.',
  );
}

seed()
  .catch((err) => {
    console.error(
      'Seed failed:',
      err,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });