'use client';

import React from 'react';
import AppCard from './AppCard';

interface DiscoverItem {
  name: string;
  description: string;
  category: string;
  link: string;
  icon?: string;
  price?: string;
}

interface DiscoverGridProps {
  items?: DiscoverItem[];
}

const DiscoverGrid: React.FC<DiscoverGridProps> = ({ items = [] }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 'var(--s-24)',
    }}>
      {items.map((item, i) => (
        <div key={item.name} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
          <AppCard 
            title={item.name}
            description={item.description}
            category={item.category}
            icon={item.icon || '📦'}
            price={item.price}
          />
        </div>
      ))}
    </div>
  );
};

export default DiscoverGrid;
