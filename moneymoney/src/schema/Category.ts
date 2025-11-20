import { z } from "zod";
import { IconSchema } from "./Icon.ts";
import {
  type Budget,
  BudgetSchema,
  type EmptyBudget,
  EmptyBudgetSchema,
} from "./Budget.ts";

/**
 * A single category from MoneyMoney
 */
export type Category = {
  budget: Budget | EmptyBudget;
  name: string;
  currency: string;
  default: boolean;
  group: boolean;
  icon: string;
  indentation: number;
  uuid: string;
};

/**
 * zod schema for a MoneyMoney Category
 *
 * @example
 * ```typescript
 * import { CategorySchema } from "@xph/moneymoney";
 *
 * const category = CategorySchema.parse({
 *   name: "Food",
 *   currency: "EUR",
 *   default: false,
 *   group: false,
 *   icon: "data:image/png;base64,iVBORw0KGgo=",
 *   indentation: 0,
 *   uuid: "1234567890",
 * });
 * ```
 */
export const CategorySchema: z.ZodType<Category> = z.object({
  budget: z.union([BudgetSchema, EmptyBudgetSchema]),
  name: z.string(),
  currency: z.string(),
  default: z.boolean(),
  group: z.boolean(),
  icon: IconSchema,
  indentation: z.number(),
  uuid: z.string(),
});

/**
 * List of MoneyMoney Categories
 */
export type Categories = Category[];

/**
 * zod schema for a list of MoneyMoney Categories
 *
 * @example
 * ```typescript
 * import { CategoriesSchema } from "@xph/moneymoney/schema";
 *
 * const categories = CategoriesSchema.parse([
 *   /* ...some categories *\/
 * ]);
 * ```
 */
export const CategoriesSchema: z.ZodType<Categories> = z.array(CategorySchema);
