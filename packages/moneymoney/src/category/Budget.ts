import { z } from "zod";

export type Period = "monthly" | "quarterly" | "yearly" | "total";
export const PeriodSchema: z.ZodType<Period> = z.enum([
  "monthly",
  "quarterly",
  "yearly",
  "total",
]);

export type Budget = {
  amount: number;
  available: number;
  period: Period;
};
export const BudgetSchema: z.ZodType<Budget> = z.object({
  amount: z.number(),
  available: z.number(),
  period: PeriodSchema,
});

export type EmptyBudget = Record<PropertyKey, never>;
export const EmptyBudgetSchema: z.ZodType<EmptyBudget> = z.object({});
