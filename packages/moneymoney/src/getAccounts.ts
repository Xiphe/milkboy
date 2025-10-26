import { fromFileUrl, join } from "@std/path";
import { osascript } from "./_osascript.ts";
import { parse as parsePlist } from "plist";
import { type Accounts, AccountsSchema } from "./schema/index.ts";

const scriptsDir = fromFileUrl(new URL("../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "exportAccounts.applescript");

/**
 * Get all accounts from MoneyMoney
 *
 * Fetches accounts directly from the MoneyMoney application running on macOS.
 *
 * @returns {Promise<Accounts>} Array of accounts
 * @throws {MoneyMoneyDatabaseLockedError} If the MoneyMoney database is locked
 * @throws {OsaScriptError} If MoneyMoney is not installed or apple script fails
 * @throws {ZodError} If the accounts are invalid
 * @throws {Error} when something unexpected happens
 * @see {Accounts}
 *
 * @example
 * ```typescript
 * import { getAccounts } from "@xph/moneymoney";
 *
 * const accounts = await getAccounts();
 * ```
 */
export async function getAccounts(): Promise<Accounts> {
  return AccountsSchema.parse(parsePlist(await osascript(scriptPath)));
}
