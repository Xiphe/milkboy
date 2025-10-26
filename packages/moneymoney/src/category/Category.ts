import { z } from "zod";
import { IconSchema } from "../Icon.ts";
import {
  type Budget,
  BudgetSchema,
  type EmptyBudget,
  EmptyBudgetSchema,
} from "./Budget.ts";

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

export type Categories = Category[];
export const CategoriesSchema: z.ZodType<Categories> = z.array(CategorySchema);
