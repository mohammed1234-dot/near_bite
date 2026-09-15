<p align="center"> <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a> </p> <h1 align="center">NearBite</h1> <p align="center">A Talabat-style food-delivery backend built around the "find vendors near me" problem — the proximity service from <em>System Design Interview, Vol. 2</em> (Alex Xu), Chapter 1.</p>

Given a customer's location and a radius, the Home API returns nearby vendors sorted by distance — without scanning the entire vendors table on every request. It does this by encoding each vendor's location as a geohash, then narrowing to a small candidate set via a geohash prefix match before running an exact Haversine distance calculation on that small set.

Built with NestJS, a progressive Node.js framework for building efficient, scalable server-side applications.

Stack
NestJS (Express platform)
PostgreSQL + Drizzle ORM
JWT auth (jsonwebtoken), roles via a custom guard
class-validator / class-transformer for request validation
ngeohash for geohash encoding and neighbor lookup
Docker Compose for local Postgres
Vitest for tests
Getting started
1. Start Postgres
bash
docker compose up -d

This starts a Postgres 16 container on localhost:5433, database nearbite.

2. Configure environment

Copy .env.example to .env (or edit .env directly) and set:

Variable	Description
NODE_ENV	development / production
PORT	API port (defaults to 3000)
DATABASE_URL	Postgres connection string, e.g. postgres://postgres:postgres@localhost:5433/nearbite
JWT_SECRET	Secret used to sign JWTs
JWT_EXPIRES_IN	Token lifetime, e.g. 1h
MAX_RADIUS_METERS	Upper bound accepted by the Home API's radius query param
DEFAULT_GEOHASH_PRECISION	Fallback geohash precision when not derived from radius
HOME_CACHE_TTL_SECONDS	TTL for the Home API's cache-aside layer
3. Install dependencies
bash
npm install
4. Run migrations
bash
npm run db:generate   # generate migration from schema.ts
npm run db:migrate    # apply migrations to the database
5. Compile and run
bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod

The API listens on http://localhost:3000 (or your configured PORT).

Scripts
Script	Purpose
npm run start:dev	Start with hot reload
npm run build	Compile to dist/
npm run start:prod	Run the compiled build
npm run db:generate	Generate a Drizzle migration from the schema
npm run db:migrate	Apply pending migrations
npm run db:studio	Open Drizzle Studio to browse the database
npm run lint	Lint with oxlint
npm run format	Format with Prettier
Data model

users — id, name, email, passwordHash, role ('admin' | 'customer'), lat, lng, createdAt

vendors — id, name, logoUrl, lat, lng, geoHash, createdBy, createdAt

products — id, vendorId, name, price (cents), description, createdAt

API reference

All protected routes require Authorization: Bearer <token>.

Auth
Method	Path	Body	Notes
POST	/users/register	{ name, email, password, lat, lng }	Creates a customer
POST	/users/login	{ email, password }	Returns { token }
Vendors (admin-only writes)
Method	Path	Body	Auth
POST	/vendors	{ name, logoUrl, lat, lng }	admin
GET	/vendors	—	public
GET	/vendors/:id	—	public
PUT	/vendors/:id	{ name?, logoUrl?, lat?, lng? }	admin
DELETE	/vendors/:id	—	admin

Creating or moving a vendor recomputes and stores its geohash.

Products (admin-only writes)
Method	Path	Body	Auth
POST	/products	{ vendorId, name, price, description }	admin
GET	/products	—	public
GET	/products/:id	—	public
PATCH	/products/:id	{ ... }	admin
DELETE	/products/:id	—	admin
Home — the proximity service
GET /home?lat=<lat>&lng=<lng>&radius=<meters>&limit=20&cursor=<id>
Authorization: Bearer <token>

Returns the nearest vendors within radius meters, sorted by distance, paginated by cursor.

lat / lng are optional — if omitted, the caller's saved location is used.
radius is capped (see MAX_RADIUS_METERS) so an unbounded radius can't force a full scan.
json
{
  "vendors": [
    {
      "id": 42,
      "name": "Koshary El Tahrir",
      "logoUrl": "https://…",
      "lat": 30.0444,
      "lng": 31.2357,
      "distanceMeters": 320
    }
  ],
  "nextCursor": null
}
How the proximity search works
Compute a geohash for the query point, at a precision chosen from the requested radius.
Query vendors whose geoHash matches that cell or one of its 8 neighbors (covers results that sit just across a cell boundary) — an indexed prefix match, not a table scan.
Run the exact Haversine distance formula only on that small candidate set.
Filter to radius, sort by distance, and paginate with a cursor.

This keeps each request's cost proportional to the candidate set, not to the total number of vendors — the difference between an approach that degrades gracefully as the marketplace grows and one that doesn't.

Testing

A Postman collection is included (see NearBite.postman_collection.json) covering registration, login, admin vendor/product management, and the Home API with and without an explicit location.

bash
npm install -g @nestjs/mau
mau deploy
Resources
NestJS Documentation
NestJS Discord
Drizzle ORM Documentation
License

UNLICENSED — private pro
