'use client';

import { motion } from 'framer-motion';

interface FavoriteIconProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteIcon({ isFavorite, onToggle }: FavoriteIconProps) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="bg-black/50 hover:bg-black/70 p-4 rounded-full transition-colors backdrop-blur-sm min-w-[48px] min-h-[48px] flex items-center justify-center"
      whileTap={{ scale: 0.9 }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <motion.svg
        className="w-6 h-6"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        initial={false}
        animate={{
          scale: isFavorite ? [1, 1.2, 1] : 1,
          fill: isFavorite ? '#ef4444' : 'none',
          stroke: isFavorite ? '#ef4444' : 'white',
        }}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>
    </motion.button>
  );
}
