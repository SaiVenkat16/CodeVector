import React from 'react';

interface CategorySelectProps {
  categories: string[];
  selectedCategory: string;
  onChange: (category: string) => void;
}

export default function CategorySelect({ categories, selectedCategory, onChange }: CategorySelectProps) {
  return (
    <section className="glass-panel" aria-label="Filters">
      <label htmlFor="category-select" className="filter-label">
        Filter by Category
      </label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className="filter-select"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </section>
  );
}
