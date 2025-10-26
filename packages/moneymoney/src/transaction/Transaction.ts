import { z } from "zod";

export type Transaction = {
  accountUuid: string;
  amount: number;
  booked: boolean;
  bookingDate: Date;
  bookingText?: string;
  categoryUuid: string;
  checkmark: boolean;
  currency: string;
  endToEndReference?: string;
  id: number;
  name: string;
  purpose?: string;
  valueDate: Date;
};
export const TransactionSchema: z.ZodType<Transaction> = z.object({
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

export type Transactions = Transaction[];
export const TransactionsSchema: z.ZodType<Transactions> =
  z.array(TransactionSchema);

export type TransactionsExport = {
  creator: string;
  transactions: Transactions;
};
export const TransactionsExportSchema: z.ZodType<TransactionsExport> = z.object(
  {
    creator: z.string(),
    transactions: TransactionsSchema,
  },
);
