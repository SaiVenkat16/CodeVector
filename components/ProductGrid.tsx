import React from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  return (
    <ul id="products-list" className="products-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}

      {loading && products.length === 0 && (
        <>
          {Array.from({ length: 8 }).map((_, idx) => (
            <li key={`skeleton-${idx}`} className="skeleton-card" aria-hidden="true" />
          ))}
        </>
      )}
    </ul>
  );
}
