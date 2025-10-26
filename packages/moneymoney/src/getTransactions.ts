import { fromFileUrl, join } from "@std/path";
import { parse as parsePlist } from "plist";
import { osascript } from "./_osascript.ts";
import { type Transactions, TransactionsExportSchema } from "./schema/index.ts";

const scriptsDir = fromFileUrl(new URL("../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "exportTransactions.applescript");

/**
 * Get all transactions from MoneyMoney
 *
 * Fetches transactions directly from the MoneyMoney application running on macOS.
 *
 * @param account - The account to get transactions for
 * @param startDate - The start date to get transactions for
 * @returns {Promise<Transactions>} Array of transactions
 * @throws {MoneyMoneyDatabaseLockedError} If the MoneyMoney database is locked
 * @throws {OsaScriptError} If MoneyMoney is not installed or apple script fails
 * @throws {ZodError} If the transactions are invalid
 * @throws {Error} when something unexpected happens
 * @see {Transactions}
 *
 * @example
 * ```typescript
 * import { getTransactions } from "@xph/moneymoney";
 *
 * const transactions = await getTransactions("1234567890", new Date("2025-01-01"));
 * ```
 */
export async function getTransactions(
  account?: string,
  startDate?: Date,
): Promise<Transactions> {
  const transactions = parsePlist(
    await osascript(
      scriptPath,
      account ?? "",
      startDate ? formatDate(startDate) : "1800-01-01",
    ),
  );

  return TransactionsExportSchema.parse(transactions).transactions;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
