import { z } from "zod";
import { IconSchema } from "../Icon.ts";

export const AccountAttributesSchema = z.record(z.string(), z.string());
export type AccountAttributes = z.infer<typeof AccountAttributesSchema>;

export const AccountBalanceSchema = z.array(z.tuple([z.number(), z.string()]));
export type AccountBalance = z.infer<typeof AccountBalanceSchema>;

export enum ACCOUNT_TYPE {
  CASH = "Cash account",
  PORTFOLIO = "Portfolio",
  SAVINGS = "Savings account",
  CREDIT_CARD = "Credit card",
  GIRO = "Giro account",
  OTHER = "Other",
  GROUP = "Account group",
  PAYPAL = "PayPal",
}

export const AccountSchema = z.object({
  accountNumber: z.string(),
  attributes: AccountAttributesSchema,
  balance: AccountBalanceSchema,
  bankCode: z.string(),
  currency: z.string(),
  group: z.boolean(),
  icon: IconSchema,
  indentation: z.number(),
  name: z.string(),
  owner: z.string(),
  portfolio: z.boolean(),
  refreshTimestamp: z.date(),
  type: z.union([z.string(), z.nativeEnum(ACCOUNT_TYPE)]),
  uuid: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;

export const AccountsSchema = z.array(AccountSchema);
export type Accounts = z.infer<typeof AccountsSchema>;
