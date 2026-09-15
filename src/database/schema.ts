import {
  pgTable,
  serial,
  varchar,
  text,
  doublePrecision,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';


// ==================== USERS ====================

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    name: text('name').notNull(),

    email: text('email').notNull().unique(),

    password_hash: text('password_hash').notNull(),

    role: text('role').notNull().default('customer'),

    lat: doublePrecision('lat').notNull(),

    lng: doublePrecision('lng').notNull(),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
);
export const vendors = pgTable(
  'vendors',
  {
    id: serial('id').primaryKey(),

    name: text('name').notNull(),

    logo_url: text('logo_url').notNull(),

    lat: doublePrecision('lat').notNull(),

    lng: doublePrecision('lng').notNull(),

    geo_hash: text('geo_hash').notNull(),

    created_by: integer('created_by')
      .notNull()
      .references(() => users.id),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('vendors_geohash_idx').on(table.geo_hash),
    index('vendors_lat_lng_idx').on(table.lat, table.lng),
    index('vendors_created_by_idx').on(table.created_by),
  ],
);
export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),

    vendorId: integer('vendor_id')
      .notNull()
      .references(() => vendors.id, {
        onDelete: 'cascade',
      }),

    name: varchar('name', {
      length: 255,
    }).notNull(),

    price: integer('price').notNull(),

    description: text('description'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },

  (table) => [
    // Get all products belonging to a vendor
    index('products_vendor_id_idx')
      .on(table.vendorId),
  ],
);



export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Vendors = typeof vendors.$inferSelect;
export type NewVendors = typeof vendors.$inferInsert;

export type Products = typeof products.$inferSelect;
export type NewProducts = typeof products.$inferInsert;