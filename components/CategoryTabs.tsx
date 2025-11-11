'use client';

import { motion } from 'framer-motion';
import type { Genre } from '@/types/tmdb';
import { getGenreIcon } from '@/lib/genreIcons';

interface CategoryTabsProps {
  categories: (Genre | { id: string; name: string })[];
  activeCategory: string | number;
  onCategoryChange: (categoryId: string | number) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-min">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          const Icon = getGenreIcon(typeof category.id === 'number' ? category.id : category.name);

          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                relative px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap
                transition-colors
                ${isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-red-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
