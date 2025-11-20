import { z } from "zod";

/**
 * A period of time
 */
export type Period = "monthly" | "quarterly" | "yearly" | "total";

/**
 * zod schema for a period of time
 *
 * @example
 * ```typescript
 * import { PeriodSchema } from "@xph/moneymoney/schema";
 *
 * const period = PeriodSchema.parse("monthly");
 * ```
 */
export const PeriodSchema: z.ZodType<Period> = z.enum([
  "monthly",
  "quarterly",
  "yearly",
  "total",
]);

/**
 * A MoneyMoney budget
 */
export type Budget = {
  amount: number;
  available: number;
  period: Period;
};

/**
 * zod schema for a MoneyMoney budget
 *
 * @example
 * ```typescript
 * import { BudgetSchema } from "@xph/moneymoney/schema";
 *
 * const budget = BudgetSchema.parse({
 *   amount: 1000,
 *   available: 1000,
 *   period: "monthly",
 * });
 * ```
 */
export const BudgetSchema: z.ZodType<Budget> = z.object({
  amount: z.number(),
  available: z.number(),
  period: PeriodSchema,
});

/**
 * An empty budget
 */
export type EmptyBudget = Record<PropertyKey, never>;

/**
 * zod schema for an empty budget
 *
 * @example
 * ```typescript
 * import { EmptyBudgetSchema } from "@xph/moneymoney/schema";
 *
 * const emptyBudget = EmptyBudgetSchema.parse({});
 * ```
 */
export const EmptyBudgetSchema: z.ZodType<EmptyBudget> = z.object({});
