import { NextRequest } from "next/server";
import { estimateFairPrice } from "@/lib/ai/price-estimator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ItemCondition, TransactionType } from "@/types/enums";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, originalMrp, condition, ageYears, transactionType } = body;

    if (originalMrp === undefined || typeof originalMrp !== "number" || originalMrp < 0) {
      return errorResponse("Please provide a valid non-negative original MRP", 400);
    }

    const valuation = estimateFairPrice({
      title: title || "",
      category: category || "books",
      originalMrp,
      condition: condition || ItemCondition.GOOD,
      ageYears: typeof ageYears === "number" ? ageYears : 1,
      transactionType: transactionType || TransactionType.SELL,
    });

    return successResponse(valuation, "AI Fair Price calculated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to calculate valuation", 500);
  }
}
