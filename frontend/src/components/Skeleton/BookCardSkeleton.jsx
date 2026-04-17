import React from "react";

/**
 * Skeleton shimmer animation via Tailwind animate-pulse.
 * Matches the exact layout of BookCard.jsx.
 */
const BookCardSkeleton = () => (
  <div className="bg-zinc-800 rounded p-4 flex flex-col animate-pulse">
    {/* Book cover placeholder */}
    <div className="bg-zinc-700 rounded h-[25vh] w-full" />
    {/* Title */}
    <div className="mt-4 h-5 bg-zinc-700 rounded w-3/4" />
    <div className="mt-2 h-4 bg-zinc-700 rounded w-1/2" />
    {/* Price */}
    <div className="mt-2 h-5 bg-zinc-700 rounded w-1/4" />
  </div>
);

/**
 * Renders a grid of N skeleton cards.
 */
export const BookListSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8 my-8">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

export default BookCardSkeleton;
