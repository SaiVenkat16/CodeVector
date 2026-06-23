import React from 'react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <li className="product-card">
      <div className="product-info">
        <span className="product-name">{product.name}</span>
        <span className="category-badge">{product.category}</span>
      </div>
      <div className="product-price">
        <span style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.8, marginRight: '1px' }}>₹</span>
        {Math.floor(product.price).toLocaleString('en-IN')}
      </div>
    </li>
  );
}
