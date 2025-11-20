import { fromFileUrl, join } from "@std/path";
import { osascript } from "./_osascript.ts";

const scriptsDir = fromFileUrl(new URL("../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "moneymoneyExists.applescript");

/**
 * Checks if MoneyMoney is installed
 * @returns {Promise<boolean>} True if MoneyMoney is installed, false otherwise
 * @throws {OsaScriptError} In case apple script fails
 * @throws {Error} when something unexpected happens
 *
 * @example
 * ```typescript
 * import { isInstalled } from "@xph/moneymoney";
 *
 * const isInstalled = await isInstalled();
 */
export async function isInstalled(): Promise<boolean> {
  return (await osascript(scriptPath)).trim() === "true";
}
