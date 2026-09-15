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
export const users=pgTable('users',{
    id:serial('id').primaryKey().notNull(),
    name:text('name').notNull(),
    email:text('email').notNull().unique(),
    password_hash:text('passwordHash').notNull(),
    role:text('role').default('customer'),
     lat:doublePrecision('lat').notNull(),
    lng:doublePrecision('lng').notNull(),
    created_at:timestamp('createdAt').defaultNow().notNull()
})
export const vendors=pgTable('vendors',{
    id:serial('id').primaryKey().notNull(),
    name:text('name').notNull(),
    logo_url:text('logoUrl').notNull(),
    lat:doublePrecision('lat').notNull(),
    lng:doublePrecision('lng').notNull(),
    geo_hash:text('geoHash').notNull(),
    created_at:timestamp('createdAt').defaultNow(),
})
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendors.id, {
      onDelete: 'cascade',
    }),
  name: varchar('name', { length: 255 }).notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
});
  export type User = typeof users.$inferSelect;
  export type NewUser = typeof users.$inferInsert;

  export type Vendors=typeof vendors.$inferSelect;
  export type NewVendors=typeof vendors.$inferInsert;

  export type Products=typeof products.$inferSelect;
  export type NewProducts=typeof products.$inferInsert;
