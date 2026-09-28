"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calculator,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Cpu,
  Layers,
  Bike,
  FileText,
  DollarSign,
  Gift,
  Repeat,
  Info,
} from "lucide-react";
import { ItemCondition, TransactionType } from "@/types/enums";
import { estimateFairPrice, PriceEstimateResult } from "@/lib/ai/price-estimator";

export default function AiPriceEstimatorPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("textbooks");
  const [itemTitle, setItemTitle] = useState<string>("");
  const [originalMrp, setOriginalMrp] = useState<string>("850");
  const [condition, setCondition] = useState<ItemCondition>(ItemCondition.GOOD);
  const [ageYears, setAgeYears] = useState<number>(1);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.SELL);

  const [result, setResult] = useState<PriceEstimateResult>(() =>
    estimateFairPrice({
      category: "textbooks",
      originalMrp: 850,
      condition: ItemCondition.GOOD,
      ageYears: 1,
      transactionType: TransactionType.SELL,
    })
  );

  const calculate = (mrpVal = originalMrp, cond = condition, age = ageYears, cat = selectedCategory, type = transactionType) => {
    const mrp = parseFloat(mrpVal);
    const res = estimateFairPrice({
      title: itemTitle,
      category: cat,
      originalMrp: isNaN(mrp) ? 0 : mrp,
      condition: cond,
      ageYears: age,
      transactionType: type,
    });
    setResult(res);
  };

  const handleMrpChange = (val: string) => {
    setOriginalMrp(val);
    calculate(val, condition, ageYears, selectedCategory, transactionType);
  };

  const handleConditionChange = (cond: ItemCondition) => {
    setCondition(cond);
    calculate(originalMrp, cond, ageYears, selectedCategory, transactionType);
  };

  const handleAgeChange = (age: number) => {
    setAgeYears(age);
    calculate(originalMrp, condition, age, selectedCategory, transactionType);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    calculate(originalMrp, condition, ageYears, cat, transactionType);
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    calculate(originalMrp, condition, ageYears, selectedCategory, type);
  };

  const quickPresets = [
    { name: "Casio fx-991EX Calculator", cat: "calculators", mrp: "1420", cond: ItemCondition.LIKE_NEW, age: 1 },
    { name: "Higher Engineering Mathematics (Grewal)", cat: "textbooks", mrp: "850", cond: ItemCondition.GOOD, age: 1 },
    { name: "Mini Drafter + Board Clip Kit", cat: "lab-gear", mrp: "650", cond: ItemCondition.GOOD, age: 2 },
    { name: "Hero Sprint Campus Bicycle", cat: "bicycles", mrp: "6500", cond: ItemCondition.FAIR, age: 2 },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-950 text-white p-6 sm:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI-Driven Academic Valuation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            AI Fair Price Suggester &amp; Valuation Tool
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
            Eliminate unrealistic bargaining and avoid underpricing your academic gear. Our intelligent valuation algorithm computes true campus resale worth based on purchase MRP, semester age, wear condition, and student demand.
          </p>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Popular Student Item Presets:</span>
        <div className="flex flex-wrap gap-2">
          {quickPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setItemTitle(preset.name);
                setSelectedCategory(preset.cat);
                setOriginalMrp(preset.mrp);
                setCondition(preset.cond);
                setAgeYears(preset.age);
                setTransactionType(TransactionType.SELL);
                calculate(preset.mrp, preset.cond, preset.age, preset.cat, TransactionType.SELL);
              }}
              className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-zinc-700 font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{preset.name}</span>
              <span className="text-zinc-400 font-normal">MRP ₹{preset.mrp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Item Details &amp; Condition Parameters
          </h2>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700">Listing Intention</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.SELL)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  transactionType === TransactionType.SELL
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                💰 Campus Resale
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.DONATION)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  transactionType === TransactionType.DONATION
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                🎁 Free Giveaway (₹0)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.SKILL_EXCHANGE)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  transactionType === TransactionType.SKILL_EXCHANGE
                    ? "border-purple-600 bg-purple-50 text-purple-900 shadow-2xs"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                💡 Skill Barter
              </button>
            </div>
          </div>

          {/* Item Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700">Academic Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: "textbooks", label: "Textbooks & Reference", icon: BookOpen },
                { id: "calculators", label: "Calculators (fx-991EX)", icon: Cpu },
                { id: "lab-gear", label: "Drafters & Lab Kits", icon: Layers },
                { id: "electronics", label: "Gadgets & Hardware", icon: Cpu },
                { id: "bicycles", label: "Campus Bicycles", icon: Bike },
                { id: "notes", label: "Handwritten Notes", icon: FileText },
              ].map((c) => {
                const Icon = c.icon;
                const isSel = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryChange(c.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSel
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSel ? "text-indigo-600" : "text-zinc-400"}`} />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & MRP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">Item Title / Model</label>
              <input
                type="text"
                placeholder="e.g. Thomas Calculus 14th Ed"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Original MRP / Purchase Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">₹</span>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 850"
                  value={originalMrp}
                  onChange={(e) => handleMrpChange(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white text-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Condition Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700">Physical Condition</label>
              <span className="text-[11px] text-zinc-400">Affects depreciation multiplier</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: ItemCondition.NEW, label: "Brand New", sub: "Unused / Sealed" },
                { id: ItemCondition.LIKE_NEW, label: "Like New", sub: "Clean & unmarked" },
                { id: ItemCondition.GOOD, label: "Good", sub: "Light shelf wear" },
                { id: ItemCondition.FAIR, label: "Fair", sub: "Notes & creases" },
              ].map((c) => {
                const isSel = condition === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleConditionChange(c.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSel
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="font-bold text-xs">{c.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSel ? "text-indigo-100" : "text-zinc-400"}`}>
                      {c.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age in Semesters / Years */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700">Item Age (Semesters / Years)</label>
            <select
              value={ageYears}
              onChange={(e) => handleAgeChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>Current Semester (&lt; 6 months) — Fresh syllabus relevance</option>
              <option value={1}>1 Year Old (2 Semesters) — Standard curriculum edition</option>
              <option value={2}>2 Years Old — Previous batch edition</option>
              <option value={3}>3+ Years Old — Senior clearance</option>
            </select>
          </div>
        </div>

        {/* Right Output Valuation Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 rounded-3xl border-2 border-indigo-200/80 p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Recommended Listing Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-indigo-700">
                    {result.recommendedPrice === 0 ? "FREE (₹0)" : `₹${result.recommendedPrice}`}
                  </span>
                  {result.recommendedPrice > 0 && (
                    <span className="text-xs text-zinc-500 font-medium">
                      Range: ₹{result.minPrice} – ₹{result.maxPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>{result.fastSellProbability}% Fast-Sell</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Predicted clearance within 48h</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{result.savingsPercent}% Junior Savings</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Compared to bookstore retail</p>
              </div>
            </div>

            {/* Explanation & Insight */}
            <div className="space-y-2 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 space-y-1.5">
                <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  Pricing Analysis
                </span>
                <p className="text-zinc-600 leading-relaxed text-[11px]">{result.explanation}</p>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                💡 <b>Campus Seller Tip:</b> {result.conditionTip}
              </div>
            </div>

            {/* 1-Click Action Button to Create Listing */}
            <Link
              href={`/listings/create?title=${encodeURIComponent(itemTitle)}&price=${result.recommendedPrice}&condition=${condition}&type=${transactionType}`}
              className="block"
            >
              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 cursor-pointer transition-all"
              >
                <span>Post Listing at ₹{result.recommendedPrice}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Community Guidance */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-5 space-y-3 text-xs text-zinc-600">
            <h4 className="font-bold text-zinc-900 text-xs">Why Campus Price Estimation Matters</h4>
            <p className="leading-relaxed">
              In college communities, unfair pricing causes items to stagnate for months without offers. Our AI pricing model balances junior affordability with fair student recovery value, maintaining trust in peer transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
