/**
 * tRPC router for BudgetBudget
 *
 * This defines the API contract between the UI and the Deno core.
 * Uses SuperJSON transformer for rich type support (Date, Map, Set, etc.)
 */

import { initTRPC } from "@trpc/server";
import { ping } from "@xph/budgetbudget";
import { string } from "zod";

const t = initTRPC.create();

export const publicProcedure = t.procedure;
export const router = t.router;

let text = "";

export const appRouter = router({
  ping: {
    ping: publicProcedure.query(() => {
      return ping();
    }),
  },
  write: publicProcedure.input(string()).mutation(({ input }) => {
    text = input.toUpperCase();
    return text;
  }),
});

export type AppRouter = typeof appRouter;
