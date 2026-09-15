ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";
--> statement-breakpoint

ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
--> statement-breakpoint

ALTER TABLE "vendors" RENAME COLUMN "logoUrl" TO "logo_url";
--> statement-breakpoint

ALTER TABLE "vendors" RENAME COLUMN "geoHash" TO "geo_hash";
--> statement-breakpoint

ALTER TABLE "vendors" RENAME COLUMN "createdAt" TO "created_at";
--> statement-breakpoint

ALTER TABLE "vendors" ADD COLUMN "created_by" integer;
--> statement-breakpoint

UPDATE "vendors"
SET "created_by" = (
  SELECT "id"
  FROM "users"
  WHERE "role" = 'admin'
  LIMIT 1
)
WHERE "created_by" IS NULL;
--> statement-breakpoint

ALTER TABLE "vendors"
ALTER COLUMN "created_by" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "users"
ALTER COLUMN "role" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "vendors"
ALTER COLUMN "created_at" SET NOT NULL;
--> statement-breakpoint

CREATE INDEX "products_vendor_id_idx"
ON "products" ("vendor_id");
--> statement-breakpoint

CREATE INDEX "vendors_geohash_idx"
ON "vendors" ("geo_hash");
--> statement-breakpoint

CREATE INDEX "vendors_lat_lng_idx"
ON "vendors" ("lat", "lng");
--> statement-breakpoint

CREATE INDEX "vendors_created_by_idx"
ON "vendors" ("created_by");
--> statement-breakpoint

ALTER TABLE "vendors"
ADD CONSTRAINT "vendors_created_by_users_id_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"("id");
--> statement-breakpoint