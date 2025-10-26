import { z } from "zod";
import { IconSchema } from "../Icon.ts";

export type AccountAttributes = Record<string, string>;
export const AccountAttributesSchema: z.ZodType<AccountAttributes> = z.record(
  z.string(),
  z.string(),
);

export type AccountBalance = [balance: number, currency: string][];
export const AccountBalanceSchema: z.ZodType<AccountBalance> = z.array(
  z.tuple([z.number(), z.string()]),
);

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

export type Account = {
  accountNumber: string;
  attributes: AccountAttributes;
  balance: AccountBalance;
  bankCode: string;
  currency: string;
  group: boolean;
  icon: string;
  indentation: number;
  name: string;
  owner: string;
  portfolio: boolean;
  refreshTimestamp: Date;
  type: string | ACCOUNT_TYPE;
  uuid: string;
};
export const AccountSchema: z.ZodType<Account> = z.object({
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

export type Accounts = Account[];
export const AccountsSchema: z.ZodType<Accounts> = z.array(AccountSchema);
