import clientPromise, { getDbName } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

interface CategoryCache {
  data: string[];
  expiresAt: number;
}

let cache: CategoryCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — categories barely change

export async function GET() {
  try {
    if (cache && cache.expiresAt > Date.now()) {
      return Response.json({ categories: cache.data });
    }

    const client = await clientPromise;
    const db = client.db(getDbName());
    const categories = await db.collection('products').distinct('category');
    categories.sort();

    cache = { data: categories, expiresAt: Date.now() + CACHE_TTL_MS };

    return Response.json({ categories });
  } catch (err) {
    console.error('GET /api/categories failed:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
