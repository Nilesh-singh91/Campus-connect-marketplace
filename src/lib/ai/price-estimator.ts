import { ItemCondition, TransactionType } from "@/types/enums";

export interface PriceEstimateInput {
  title?: string;
  category?: string;
  originalMrp: number;
  condition: ItemCondition;
  ageYears?: number;
  transactionType?: TransactionType;
}

export interface PriceEstimateResult {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  savingsPercent: number;
  fastSellProbability: number;
  demandScore: "HIGH" | "MODERATE" | "STABLE";
  explanation: string;
  conditionTip: string;
}

const CATEGORY_BASE_RATES: Record<string, { baseRate: number; demand: "HIGH" | "MODERATE" | "STABLE" }> = {
  books: { baseRate: 0.50, demand: "HIGH" },
  textbooks: { baseRate: 0.52, demand: "HIGH" },
  calculators: { baseRate: 0.60, demand: "HIGH" },
  electronics: { baseRate: 0.58, demand: "HIGH" },
  "lab-gear": { baseRate: 0.42, demand: "MODERATE" },
  stationery: { baseRate: 0.38, demand: "STABLE" },
  bicycles: { baseRate: 0.48, demand: "MODERATE" },
  notes: { baseRate: 0.35, demand: "HIGH" },
  default: { baseRate: 0.45, demand: "MODERATE" },
};

const CONDITION_MULTIPLIERS: Record<ItemCondition, { mult: number; tip: string }> = {
  [ItemCondition.NEW]: {
    mult: 1.25,
    tip: "Unused/Sealed condition commands top campus resale value (up to 75% of MRP).",
  },
  [ItemCondition.LIKE_NEW]: {
    mult: 1.05,
    tip: "Crisp pages without highlights or bends sell rapidly to upcoming semester students.",
  },
  [ItemCondition.GOOD]: {
    mult: 0.90,
    tip: "Light shelf wear or minor annotations; priced attractively for rapid campus handover.",
  },
  [ItemCondition.FAIR]: {
    mult: 0.70,
    tip: "Visible wear or binding crease; budget-friendly pricing ensures quick clearance.",
  },
};

export function estimateFairPrice(input: PriceEstimateInput): PriceEstimateResult {
  const { originalMrp, condition, ageYears = 1, category = "default", transactionType = TransactionType.SELL } = input;

  // Handle Free Giveaways
  if (transactionType === TransactionType.DONATION) {
    return {
      recommendedPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      savingsPercent: 100,
      fastSellProbability: 99,
      demandScore: "HIGH",
      explanation: "Free campus giveaway for peer reuse and zero waste.",
      conditionTip: "Community donation - 100% free for students.",
    };
  }

  // Handle Skill Barter
  if (transactionType === TransactionType.SKILL_EXCHANGE) {
    return {
      recommendedPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      savingsPercent: 100,
      fastSellProbability: 95,
      demandScore: "HIGH",
      explanation: "Cashless peer-to-peer academic service or tutoring exchange.",
      conditionTip: "Mutual skill swap - no fiat monetary cost.",
    };
  }

  const safeMrp = Math.max(0, originalMrp);
  if (safeMrp === 0) {
    return {
      recommendedPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      savingsPercent: 0,
      fastSellProbability: 80,
      demandScore: "MODERATE",
      explanation: "Enter original MRP to calculate an accurate AI valuation.",
      conditionTip: "Specify purchase price for detailed breakdown.",
    };
  }

  // Match category rate
  const catKey = category.toLowerCase().replace(/[^a-z]/g, "");
  let catConfig = CATEGORY_BASE_RATES.default;
  for (const [k, v] of Object.entries(CATEGORY_BASE_RATES)) {
    if (catKey.includes(k)) {
      catConfig = v;
      break;
    }
  }

  const condConfig = CONDITION_MULTIPLIERS[condition] || CONDITION_MULTIPLIERS[ItemCondition.GOOD];

  // Age depreciation curve: 0y = 1.0, 1y = 0.88, 2y = 0.76, 3y+ = 0.65
  const ageFactor = Math.max(0.60, 1.0 - Math.min(ageYears, 4) * 0.11);

  // Compute calculated valuation
  const rawPrice = safeMrp * catConfig.baseRate * condConfig.mult * ageFactor;
  // Round to nearest multiple of 10 for clean Indian campus pricing
  const recommendedPrice = Math.max(20, Math.round(rawPrice / 10) * 10);
  const minPrice = Math.max(10, Math.round((recommendedPrice * 0.88) / 10) * 10);
  const maxPrice = Math.max(recommendedPrice, Math.round((recommendedPrice * 1.15) / 10) * 10);

  const savingsPercent = Math.min(95, Math.max(10, Math.round(((safeMrp - recommendedPrice) / safeMrp) * 100)));

  // Fast sell likelihood
  let fastSellProbability = 85;
  if (condition === ItemCondition.NEW || condition === ItemCondition.LIKE_NEW) fastSellProbability += 8;
  if (catConfig.demand === "HIGH") fastSellProbability += 4;
  if (ageYears <= 1) fastSellProbability += 3;
  fastSellProbability = Math.min(98, fastSellProbability);

  return {
    recommendedPrice,
    minPrice,
    maxPrice,
    savingsPercent,
    fastSellProbability,
    demandScore: catConfig.demand,
    explanation: `Based on ₹${safeMrp} MRP in ${catConfig.demand.toLowerCase()} campus demand, students save ${savingsPercent}% compared to retail retail rates.`,
    conditionTip: condConfig.tip,
  };
}
