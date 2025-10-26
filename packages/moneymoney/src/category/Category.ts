import { z } from "zod";
import { IconSchema } from "../Icon.ts";
import { BudgetSchema, EmptyBudgetSchema } from "./Budget.ts";
import type { Tree } from "../toTree.ts";

export const CategorySchema = z.object({
  budget: z.union([BudgetSchema, EmptyBudgetSchema]),
  name: z.string(),
  currency: z.string(),
  default: z.boolean(),
  group: z.boolean(),
  icon: IconSchema,
  indentation: z.number(),
  uuid: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const CategoriesSchema = z.array(CategorySchema);
export type Categories = z.infer<typeof CategoriesSchema>;

export type CategoryTree = Tree<Category>;
