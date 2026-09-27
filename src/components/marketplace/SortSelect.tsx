"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectProps {
  currentSort?: string;
}

export const SortSelect: React.FC<SortSelectProps> = ({ currentSort = "newest" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1");
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500 text-xs font-medium">Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="newest">Recently Listed</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
};
