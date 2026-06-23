import 'dotenv/config';
import { MongoClient } from 'mongodb';

const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 5_000;

const CATEGORIES = [
  'Electronics',
  'Home & Kitchen',
  'Books',
  'Clothing',
  'Sports',
  'Toys',
  'Beauty',
  'Groceries',
  'Automotive',
  'Furniture',
  'Footwear',
  'Stationery',
];

const ADJECTIVES = ['Premium', 'Classic', 'Compact', 'Pro', 'Eco', 'Smart', 'Deluxe', 'Basic', 'Ultra', 'Mini'];
const NOUNS = ['Widget', 'Gadget', 'Tool', 'Kit', 'Set', 'Device', 'Item', 'Pack', 'Unit', 'Case'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(): number {
  return Math.floor(Math.random() * 9990 + 10);
}

function buildProduct(index: number, baseTimeMs: number) {
  // Stagger created_at by index so "newest first" ordering is meaningful
  // even before any live inserts happen.
  const createdAt = new Date(baseTimeMs + index * 10);
  return {
    name: `${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)}`,
    category: randomFrom(CATEGORIES),
    price: randomPrice(),
    createdAt,
    updatedAt: createdAt,
  };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI. Copy .env.local.example to .env.local and fill it in.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'codevector');
  const collection = db.collection('products');

  console.log('Clearing any existing products...');
  await collection.deleteMany({});

  console.log(`Seeding ${TOTAL_PRODUCTS} products in batches of ${BATCH_SIZE}...`);
  const start = Date.now();
  const baseTimeMs = Date.now() - TOTAL_PRODUCTS * 10;

  for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
    const batch = [];
    const end = Math.min(i + BATCH_SIZE, TOTAL_PRODUCTS);
    for (let j = i; j < end; j++) {
      batch.push(buildProduct(j, baseTimeMs));
    }
    await collection.insertMany(batch, { ordered: false });
    console.log(`Inserted ${end} / ${TOTAL_PRODUCTS}`);
  }

  console.log('Creating index on { category: 1, _id: -1 }...');
  await collection.createIndex({ category: 1, _id: -1 });

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done. Seeded ${TOTAL_PRODUCTS} products in ${seconds}s.`);

  await client.close();
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
