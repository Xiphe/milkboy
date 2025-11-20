import { z } from "zod";
import { IconSchema } from "./Icon.ts";

/**
 * Custom Attributes for a MoneyMoney Account
 */
export type AccountAttributes = Record<string, string>;

/**
 * zod schema for custom attributes of a MoneyMoney Account
 *
 * @example
 * ```typescript
 * import { AccountAttributesSchema } from "@xph/moneymoney/schema";
 *
 * const attributes = AccountAttributesSchema.parse({
 *   "some-data": "some-value",
 * });
 * ```
 */
export const AccountAttributesSchema: z.ZodType<AccountAttributes> = z.record(
  z.string(),
  z.string(),
);

/**
 * Balance of a MoneyMoney Account
 */
export type AccountBalance = [balance: number, currency: string][];

/**
 * zod schema for the balance of a MoneyMoney Account
 *
 * @example
 * ```typescript
 * import { AccountBalanceSchema } from "@xph/moneymoney/schema";
 *
 * const balance = AccountBalanceSchema.parse([[1000, "EUR"]]);
 * ```
 */
export const AccountBalanceSchema: z.ZodType<AccountBalance> = z.array(
  z.tuple([z.number(), z.string()]),
);

/**
 * Common MoneyMoney account types
 */
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

/**
 * A MoneyMoney Account
 */
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

/**
 * zod schema for a MoneyMoney Account
 * @example
 * ```typescript
 * import { AccountSchema, ACCOUNT_TYPE } from "@xph/moneymoney/schema";
 *
 * const account = AccountSchema.parse({
 *   name: "My Account",
 *   balance: [[1000, "EUR"]],
 *   bankCode: "123456789",
 *   currency: "EUR",
 *   group: false,
 *   icon: "data:image/png;base64,iVBORw0KGgo=",
 *   indentation: 0,
 *   name: "My Account",
 *   owner: "John Doe",
 *   portfolio: false,
 *   refreshTimestamp: new Date(),
 *   type: ACCOUNT_TYPE.CASH,
 *   uuid: "1234567890",
 * });
 * ```
 */
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

/**
 * List of MoneyMoney Accounts
 */
export type Accounts = Account[];

/**
 * zod schema for a list of MoneyMoney Accounts
 * @example
 * ```typescript
 * import { AccountsSchema } from "@xph/moneymoney/schema";
 *
 * const accounts = AccountsSchema.parse([/* ...some accounts *\/]);
 * ```
 */
export const AccountsSchema: z.ZodType<Accounts> = z.array(AccountSchema);
