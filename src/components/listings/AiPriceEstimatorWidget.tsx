"use client";

import React, { useState } from "react";
import { Sparkles, TrendingUp, CheckCircle, Calculator, Info, ShieldCheck } from "lucide-react";
import { ItemCondition, TransactionType } from "@/types/enums";
import { estimateFairPrice, PriceEstimateResult } from "@/lib/ai/price-estimator";

interface AiPriceEstimatorWidgetProps {
  condition: string;
  category?: string;
  transactionType?: string;
  onApplyPrice?: (price: number) => void;
  compact?: boolean;
}

export const AiPriceEstimatorWidget: React.FC<AiPriceEstimatorWidgetProps> = ({
  condition,
  category = "books",
  transactionType = "SELL",
  onApplyPrice,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originalMrp, setOriginalMrp] = useState<string>("");
  const [ageYears, setAgeYears] = useState<number>(1);
  const [result, setResult] = useState<PriceEstimateResult | null>(null);

  const calculate = () => {
    const mrp = parseFloat(originalMrp);
    if (isNaN(mrp) || mrp <= 0) return;

    const res = estimateFairPrice({
      originalMrp: mrp,
      condition: (condition as ItemCondition) || ItemCondition.GOOD,
      category,
      ageYears,
      transactionType: (transactionType as TransactionType) || TransactionType.SELL,
    });
    setResult(res);
  };

  if (transactionType === "DONATION") {
    return (
      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <b>Free Campus Giveaway:</b> Price is automatically fixed at ₹0 to facilitate peer recycling and graduation donations.
        </span>
      </div>
    );
  }

  if (transactionType === "SKILL_EXCHANGE") {
    return (
      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          <b>Skill & Academic Barter:</b> Non-monetary peer tutoring exchange. Detail your offering & requested skill in the description.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              AI Fair Price Suggester
              <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                ML Valuation
              </span>
            </h4>
            <p className="text-[11px] text-zinc-500">Calculate competitive campus resale rates based on condition & MRP</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && originalMrp) calculate();
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
        >
          {isOpen ? "Hide Calculator" : "Estimate Price"}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-indigo-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Original Purchase MRP (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 650"
                  value={originalMrp}
                  onChange={(e) => setOriginalMrp(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Age of Item (Semesters/Years)
              </label>
              <select
                value={ageYears}
                onChange={(e) => setAgeYears(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Current Semester (&lt; 6 months)</option>
                <option value={1}>1 Year Old (1–2 Semesters)</option>
                <option value={2}>2 Years Old</option>
                <option value={3}>3+ Years Old</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={calculate}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculate Fair Market Price
          </button>

          {result && result.recommendedPrice > 0 && (
            <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Suggested Listing Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-indigo-700">₹{result.recommendedPrice}</span>
                    <span className="text-xs text-zinc-500">(Range: ₹{result.minPrice} – ₹{result.maxPrice})</span>
                  </div>
                </div>

                {onApplyPrice && (
                  <button
                    type="button"
                    onClick={() => onApplyPrice(result.recommendedPrice)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Apply Price
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-zinc-100 text-[11px]">
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{result.fastSellProbability}% Fast Sell Probability</span>
                </div>
                <div className="text-zinc-500">
                  Buyer saves <b className="text-zinc-800">{result.savingsPercent}%</b> vs MRP
                </div>
              </div>

              <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded-lg leading-relaxed">
                💡 <b>Valuation Insight:</b> {result.conditionTip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
