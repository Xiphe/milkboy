import { z } from "zod";

export const PeriodSchema = z.enum(["monthly", "quarterly", "yearly", "total"]);
export type Period = z.infer<typeof PeriodSchema>;

export const BudgetSchema = z.object({
  amount: z.number(),
  available: z.number(),
  period: PeriodSchema,
});
export type Budget = z.infer<typeof BudgetSchema>;

export const EmptyBudgetSchema = z.object({});
export type EmptyBudget = z.infer<typeof EmptyBudgetSchema>;
