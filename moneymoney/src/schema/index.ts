/**
 * Zod Schemas for MoneyMoney data
 * @module
 *
 * @example
 * ```typescript
 * import {
 *   AccountSchema,
 *   ACCOUNT_TYPE
 * } from "@xph/moneymoney/schema";
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
export * from "./Account.ts";
export * from "./Budget.ts";
export * from "./Category.ts";
export * from "./Transaction.ts";
export * from "./Icon.ts";
