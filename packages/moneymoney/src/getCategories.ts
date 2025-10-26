import { fromFileUrl, join } from "@std/path";
import { parse as parsePlist } from "plist";
import { osascript } from "./_osascript.ts";
import { type Categories, CategoriesSchema } from "./schema/index.ts";

const scriptsDir = fromFileUrl(new URL("../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "exportCategories.applescript");

/**
 * Get all categories from MoneyMoney
 *
 * Fetches categories directly from the MoneyMoney application running on macOS.
 *
 * @returns {Promise<Categories>} Array of categories
 * @throws {MoneyMoneyDatabaseLockedError} If the MoneyMoney database is locked
 * @throws {OsaScriptError} If MoneyMoney is not installed or apple script fails
 * @throws {ZodError} If the categories are invalid
 * @throws {Error} when something unexpected happens
 * @see {Categories}
 *
 * @example
 * ```typescript
 * import { getCategories } from "@xph/moneymoney";
 *
 * const categories = await getCategories();
 * ```
 */
export async function getCategories(): Promise<Categories> {
  return CategoriesSchema.parse(parsePlist(await osascript(scriptPath)));
}
