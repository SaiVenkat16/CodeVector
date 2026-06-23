import { ObjectId } from 'mongodb';
import clientPromise, { getDbName } from '@/lib/mongodb';

// This route reads fresh data on every request — never cache/prerender it.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const cursor = searchParams.get('cursor');
    const limitParam = Number(searchParams.get('limit'));
    const limit = Math.min(
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 20,
      100
    );

    const client = await clientPromise;
    const db = client.db(getDbName());

    const filter: Record<string, unknown> = {};
    if (category) {
      filter.category = category;
    }

    if (cursor) {
      if (!ObjectId.isValid(cursor)) {
        return Response.json({ error: 'Invalid cursor' }, { status: 400 });
      }
      // Keyset pagination: only fetch documents "older" than the last one
      // the client already has. This stays correct even if new documents
      // are inserted above the cursor while the user keeps paginating.
      filter._id = { $lt: new ObjectId(cursor) };
    }

    const items = await db
      .collection('products')
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();

    const hasMore = items.length === limit;
    const nextCursor = hasMore ? items[items.length - 1]._id.toString() : null;

    return Response.json({ items, nextCursor, hasMore });
  } catch (err) {
    console.error('GET /api/products failed:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
