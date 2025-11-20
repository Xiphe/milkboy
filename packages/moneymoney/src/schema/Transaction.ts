import { z } from "zod";

/**
 * A MoneyMoney Transaction
 */
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

/**
 * zod schema for a MoneyMoney Transaction
 *
 * @example
 * ```typescript
 * import { TransactionSchema } from "@xph/moneymoney/schema";
 *
 * const transaction = TransactionSchema.parse({
 *   accountUuid: "1234567890",
 *   amount: 100,
 *   booked: true,
 *   bookingDate: new Date(),
 *   bookingText: "Some text",
 *   categoryUuid: "1234567890",
 *   checkmark: true,
 *   currency: "EUR",
 *   endToEndReference: "1234567890",
 *   id: 1234567890,
 *   name: "Some name",
 *   purpose: "Some purpose",
 *   valueDate: new Date(),
 * });
 * ```
 */
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

/**
 * List of MoneyMoney Transactions
 */
export type Transactions = Transaction[];

/**
 * zod schema for a list of MoneyMoney Transactions
 *
 * @example
 * ```typescript
 * import { TransactionsSchema } from "@xph/moneymoney/schema";
 *
 * const transactions = TransactionsSchema.parse([/* ...some transactions *\/]);
 * ```
 */
export const TransactionsSchema: z.ZodType<Transactions> =
  z.array(TransactionSchema);

/**
 * A MoneyMoney Transactions Export
 */
export type TransactionsExport = {
  creator: string;
  transactions: Transactions;
};

/**
 * zod schema for a MoneyMoney Transactions Export
 *
 * @example
 * ```typescript
 * import { TransactionsExportSchema } from "@xph/moneymoney/schema";
 *
 * const transactionsExport = TransactionsExportSchema.parse({
 *   creator: "Some creator",
 *   transactions: [/* ...some transactions *\/],
 * });
 * ```
 */
export const TransactionsExportSchema: z.ZodType<TransactionsExport> = z.object(
  {
    creator: z.string(),
    transactions: TransactionsSchema,
  },
);
