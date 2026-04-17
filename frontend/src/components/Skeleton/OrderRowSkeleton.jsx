import React from "react";

/**
 * Skeleton row for order history table.
 */
const OrderRowSkeleton = () => (
  <div className="bg-zinc-800 w-full rounded py-3 px-2 flex gap-2 mt-1 animate-pulse">
    <div className="w-[3%] h-4 bg-zinc-700 rounded" />
    <div className="w-[22%] h-4 bg-zinc-700 rounded" />
    <div className="w-[40%] hidden md:block h-4 bg-zinc-700 rounded" />
    <div className="w-[9%] h-4 bg-zinc-700 rounded" />
    <div className="w-[16%] h-4 bg-zinc-700 rounded" />
  </div>
);

export const OrderTableSkeleton = ({ rows = 6 }) => (
  <div className="mt-2">
    {Array.from({ length: rows }).map((_, i) => (
      <OrderRowSkeleton key={i} />
    ))}
  </div>
);

export default OrderRowSkeleton;
