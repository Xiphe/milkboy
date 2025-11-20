/**
 * Load typed data from MoneyMoney
 * @module
 *
 * @example
 * ```typescript
 * import { getAccounts, getCategories, getTransactions } from "@xph/moneymoney";
 *
 * const accounts = await getAccounts();
 * const categories = await getCategories();
 * const transactions = await getTransactions();
 * ```
 */

export * from "./getAccounts.ts";
export * from "./getCategories.ts";
export * from "./getTransactions.ts";
export * from "./isInstalled.ts";
export * from "./handleMoneyMoneyLocked.ts";
export { OsaScriptError } from "./_osascript.ts";
