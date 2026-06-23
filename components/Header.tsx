import React from 'react';

export default function Header() {
  return (
    <header className="header-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <h1 id="main-heading" style={{ marginBottom: 0 }}>Product Catalog</h1>
        <div className="header-badge" id="catalog-status-badge" style={{ marginBottom: 0 }}>
          <span className="header-badge-dot"></span>
          <span>Live Catalog · 200,000+ Products</span>
        </div>
      </div>
      <p className="subtitle">
        Real-time, newest-first product feed built with keyset-based cursor pagination. 
        Resilient to concurrent writes and updates.
      </p>
    </header>
  );
}
