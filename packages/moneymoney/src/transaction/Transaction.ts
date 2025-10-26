import { z } from "zod";

export const TransactionSchema = z.object({
  accountUuid: z.string(),
  amount: z.number(),
  booked: z.boolean(),
  bookingDate: z.date(),
  bookingText: z.string().optional(),
  categoryUuid: z.string(),
  checkmark: z.boolean(),
  currency: z.string(),
  endToEndReference: z.string().optional(),
  id: z.number(),
  name: z.string(),
  purpose: z.string().optional(),
  valueDate: z.date(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const TransactionsSchema = z.array(TransactionSchema);
export type Transactions = z.infer<typeof TransactionsSchema>;

export const TransactionsExportSchema = z.object({
  creator: z.string(),
  transactions: TransactionsSchema,
});
export type TransactionsExport = z.infer<typeof TransactionsExportSchema>;
