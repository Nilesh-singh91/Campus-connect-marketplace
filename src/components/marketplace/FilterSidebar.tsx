"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RotateCcw, GraduationCap, Lock, Globe } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  _count?: { listings: number };
}

export interface CollegeOption {
  id: string;
  domain: string;
  collegeName: string;
  _count?: { listings: number };
}

interface FilterSidebarProps {
  categories: CategoryOption[];
  colleges?: CollegeOption[];
  userCollegeId?: string | null;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, colleges = [], userCollegeId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentCollege = searchParams.get("college") || "";
  const currentCampusOnly = searchParams.get("campusOnly") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentType = searchParams.get("type") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/browse?${params.toString()}`);
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get("minPrice") as string;
    const max = formData.get("maxPrice") as string;

    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");

    params.set("page", "1");
    router.push(`/browse?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/browse");
  };

  const conditions = [
    { label: "All Conditions", value: "" },
    { label: "Brand New", value: "NEW" },
    { label: "Like New", value: "LIKE_NEW" },
    { label: "Good", value: "GOOD" },
    { label: "Fair", value: "FAIR" },
  ];

  const transactionTypes = [
    { label: "All Types", value: "" },
    { label: "For Sale Only", value: "SELL" },
    { label: "Exchanges Only", value: "EXCHANGE" },
    { label: "🎁 Free Giveaways (₹0)", value: "DONATION" },
    { label: "💡 Skill Barter", value: "SKILL_EXCHANGE" },
    { label: "Sell or Exchange", value: "BOTH" },
  ];

  const hasActiveFilters = !!(currentCategory || currentCollege || currentCampusOnly || currentCondition || currentType || minPrice || maxPrice);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <h3 className="font-semibold text-zinc-900 text-base">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* College Campus Filter */}
      {colleges.length > 0 && (
        <div className="pb-4 border-b border-zinc-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            College Campus
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => updateFilter("college", "all")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex justify-between items-center ${
                currentCollege === "all" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span>🌐 All Campuses</span>
            </button>
            {colleges.map((col) => {
              const isSelected = currentCollege === col.id || currentCollege === col.domain || (!currentCollege && userCollegeId === col.id);
              const isMyCollege = userCollegeId === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => updateFilter("college", col.domain)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex justify-between items-center ${
                    isSelected ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span className="truncate max-w-[140px]" title={col.collegeName}>
                    {col.collegeName.split("(")[0].trim()}
                    {isMyCollege && <span className="ml-1 text-[10px] text-emerald-600 font-bold">(Mine)</span>}
                  </span>
                  {col._count?.listings !== undefined && (
                    <span className="text-[11px] text-zinc-400 ml-1 font-normal">{col._count.listings}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Campus Restriction Scope Filter */}
      <div className="pb-4 border-b border-zinc-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          Campus Scope
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("campusOnly", "")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              !currentCampusOnly ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => updateFilter("campusOnly", "true")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentCampusOnly === "true" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Campus Exclusive Only</span>
          </button>
          <button
            onClick={() => updateFilter("campusOnly", "false")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentCampusOnly === "false" ? "bg-blue-50 text-blue-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <Globe className="w-3 h-3 text-blue-600" />
            <span>Multi-Campus Visible</span>
          </button>
        </div>
      </div>

      {/* Category List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Categories</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", "")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex justify-between items-center ${
              !currentCategory ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex justify-between items-center ${
                currentCategory === cat.slug ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat._count?.listings !== undefined && (
                <span className="text-xs text-zinc-400 ml-2 font-normal">{cat._count.listings}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Type */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Transaction Type</h4>
        <div className="space-y-1">
          {transactionTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => updateFilter("type", t.value)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                currentType === t.value ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Condition */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Item Condition</h4>
        <div className="flex flex-wrap gap-1.5">
          {conditions.map((c) => (
            <button
              key={c.value}
              onClick={() => updateFilter("condition", c.value)}
              className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                currentCondition === c.value
                  ? "bg-zinc-900 border-zinc-900 text-white font-medium"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 bg-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Price Range (₹)</h4>
        <form onSubmit={handlePriceSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="minPrice"
              defaultValue={minPrice}
              placeholder="Min"
              min={0}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              name="maxPrice"
              defaultValue={maxPrice}
              placeholder="Max"
              min={0}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full text-xs py-1">
            Apply Price Filter
          </Button>
        </form>
      </div>
    </div>
  );
};
