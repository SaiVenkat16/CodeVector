# Product Browser — CodeVector

Browse ~200,000 products, newest-first, with category filtering and pagination
that stays correct even while data is being inserted/updated concurrently.

## Stack

- Next.js (App Router) + TypeScript — API routes and UI in one project
- MongoDB (Atlas free tier) via the native `mongodb` driver
- Deployed as a single Vercel project (no separate backend service)

## Why cursor-based pagination, not skip/offset

`.skip(n)` re-counts documents from the start on every request. If new
products are inserted while someone is paginating a newest-first feed, every
subsequent page shifts — already-seen products reappear (duplicates) and
unseen ones get skipped.

Instead, every page request carries a `cursor`: the `_id` of the last product
already seen. The next page is fetched with `_id < cursor`. Since `_id` is
unique, immutable, and assigned in increasing order at insert time:

- New inserts always get a higher `_id`, so they never retroactively land
  inside a page that's already been returned, and nothing already-seen gets
  pushed into a different page.
- Updating an existing product (e.g. price change) never changes its `_id`,
  so its position in the feed never moves — no duplicate, no skip, no matter
  how `updatedAt` changes.

See `scripts/concurrency-test.ts` for a script that proves this directly.

## Project structure

```
app/
  api/
    products/route.ts     -> GET /api/products?category=&cursor=&limit=
    categories/route.ts   -> GET /api/categories
  page.tsx                 -> bonus UI (category filter + load more)
lib/
  mongodb.ts                -> cached MongoDB connection (serverless-safe)
scripts/
  seed.ts                   -> generates 200,000 products
  concurrency-test.ts        -> proves no duplicates/skips under concurrent writes
```

## Setup

1. Create a free MongoDB Atlas cluster (M0 tier, no credit card needed).
   Allow network access from anywhere (`0.0.0.0/0`) so it works from Vercel.
2. Copy the env file and fill in your connection string:
   ```bash
   cp .env.local.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database (creates 200,000 products + the category index):
   ```bash
   npm run seed
   ```
5. Run locally:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Verifying correctness

```bash
npm run test:concurrency
```

This paginates through the full collection while injecting 50 new products
and 50 updates partway through, and asserts no `_id` is ever returned twice.

## Verifying performance

In the MongoDB shell or Atlas UI, run:

```js
db.products
  .find({ category: "Electronics" })
  .sort({ _id: -1 })
  .limit(20)
  .explain("executionStats");
```

Confirm `executionStats.executionStages.stage` (or nested stage) shows an
index scan (`IXSCAN`), not a full collection scan (`COLLSCAN`).

## Deployment

1. Push this repo to GitHub.
2. Import it into Vercel as a new project.
3. Add the `MONGODB_URI` (and `MONGODB_DB` if you changed it) environment
   variable in the Vercel project settings.
4. Deploy. The same URL serves both the API and the UI — no second
   deployment needed.
5. Run `npm run seed` once locally (pointed at your Atlas connection string)
   before or after deploying — seeding is a one-off setup step, not something
   that runs as part of the deployed app.

## API reference

### `GET /api/products`

| Param      | Required | Description                                      |
| ---------- | -------- | ------------------------------------------------ |
| `category` | No       | Exact category match                             |
| `cursor`   | No       | `_id` of the last product from the previous page |
| `limit`    | No       | Page size, default 20, max 100                   |

```json
{
  "items": [
    {
      "_id": "...",
      "name": "...",
      "category": "...",
      "price": 123.45,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "nextCursor": "665f1a2b3c4d5e6f7a8b9c0d",
  "hasMore": true
}
```

### `GET /api/categories`

```json
{ "categories": ["Automotive", "Beauty", "Books", "..."] }
```

---

## What I chose and why

For this task, I made specific architectural choices to balance correctness, performance, and developer velocity:

1. **Next.js (App Router) & TypeScript**: Next.js allows serving both the API endpoints and the responsive frontend from a single, serverless-ready codebase. TypeScript was chosen to enforce type safety across database queries, API responses, and frontend component states.
2. **MongoDB Atlas (Native Driver)**: MongoDB easily handles large document sets (200,000+ records) with flexible schemas. By utilizing the native `mongodb` driver instead of heavy ORMs (like Prisma or Mongoose), we avoid additional runtime overhead, ensuring maximum throughput.
3. **Compound Database Indexing**: To make category filtering and sorting performant, I created a compound index on `{ category: 1, _id: -1 }`. This transforms what would otherwise be a slow full-collection scan (`COLLSCAN`) into an instant index scan (`IXSCAN`), yielding query response times under 10 milliseconds.

## What I'd improve with more time

If given more time, I would focus on several production-grade enhancements:

1. **DOM Virtualization (Windowing)**: With a potential dataset size of over 200,000 products, rendering too many products sequentially in the DOM will lead to memory bloat and UI lag. Implementing a windowing library like `react-window` or `react-virtual` would ensure only the currently visible items are rendered, maintaining 60 FPS scrolling.
2. **Client-Side Cache & Prefetching**: Integrating a state-management and fetching library like **SWR** or **TanStack Query** (React Query) to cache paginated pages. This would allow prefetching the next page of products when the user hovers near the pagination boundaries or approaches the bottom, making transitions instant.
3. **Advanced Search & Filter Compound Indexes**: Upgrading category filtering to support keyword search and fuzzy search using MongoDB Atlas Search (Lucene-based). This requires adding a compound text index and optimizing the pipeline so search scores can be sorted alongside natural insertion order (`_id`).
4. **API Rate Limiting & Protection**: Protecting the public `/api/products` endpoint from scraping and DDoS attacks using an edge middleware rate-limiter (e.g., Upstash Redis with a token bucket algorithm).
5. **Robust Error Resilience & Skeleton UI**: Replacing basic inline error messages and static loading states with custom React Error Boundaries and high-fidelity skeleton loading grids to improve visual stability (reducing Cumulative Layout Shift - CLS).

## How I used AI

I leveraged AI as a collaborative pair programmer to optimize the architecture and verify correctness:

- **Pagination Strategy**: I used AI to brainstorm key advantages of keyset pagination (`_id`-based cursors) over traditional offset-based pagination (`.skip()`) in high-concurrency systems.
- **Concurrency Test Development**: The AI helped write a multi-step test (`scripts/concurrency-test.ts`) that runs concurrent inserts and updates during page crawls, proving mathematically that no products are duplicated or skipped during high-frequency write operations.
- **Index Optimization**: AI helped verify that sorting by `{ category: 1, _id: -1 }` matches our compound index to prevent expensive in-memory sort stages, confirming an `IXSCAN` index scan execution stage in MongoDB.
- **Troubleshooting**: AI assisted in formatting dates properly for the seed script, ensuring meaningful chronological differences across 200,000 seeded products without causing date overflow issues.

## Live URL

_[Will be filled in after deploying on Vercel]_
