import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  }
} else {
  // Fallback to a Proxy to prevent Next.js build-time static generation from failing.
  // Throws a descriptive runtime error only when a database connection is actually attempted.
  clientPromise = Promise.resolve(
    new Proxy({} as MongoClient, {
      get() {
        throw new Error(
          'Missing MONGODB_URI environment variable. Please set it in your .env.local file.'
        );
      },
    })
  );
}

export default clientPromise;

export function getDbName(): string {
  return process.env.MONGODB_DB || 'codevector';
}
