'use client';

import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import CategorySelect from '@/components/CategorySelect';
import ProductGrid from '@/components/ProductGrid';
import ErrorBanner from '@/components/ErrorBanner';
import LoadMoreButton from '@/components/LoadMoreButton';
import { Product, ProductsResponse } from '@/lib/types';

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {
        // Category dropdown is non-critical; fail silently and leave it empty.
      });
  }, []);

  const fetchPage = useCallback(
    async (category: string, cursorToUse: string | null) => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (cursorToUse) params.set('cursor', cursorToUse);
      params.set('limit', '20');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return (await res.json()) as ProductsResponse;
    },
    []
  );

  // Reset and load page 1 whenever the category filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPage(selectedCategory, null)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.items);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load products. Check your MongoDB connection.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, fetchPage]);

  const loadMore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPage(selectedCategory, cursor);
      setProducts((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setError('Could not load more products.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: '3rem 2rem',
      }}
    >
      <div className="top-layout">
        <Header />
        <CategorySelect
          categories={categories}
          selectedCategory={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {error && <ErrorBanner error={error} />}

      <ProductGrid products={products} loading={loading} />

      {products.length === 0 && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <svg
            style={{ width: '3rem', height: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p>No products match the selected criteria.</p>
        </div>
      )}

      {hasMore && products.length > 0 && (
        <LoadMoreButton loading={loading} onClick={loadMore} />
      )}

      {!hasMore && products.length > 0 && (
        <div className="status-text" id="end-of-feed-message">
          <svg
            style={{ width: '1.25rem', height: '1.25rem', color: 'var(--price-color)' }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>You've reached the end of the catalog.</span>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
