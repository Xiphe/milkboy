import { fromFileUrl, join } from "@std/path";
import { osascript } from "./_osascript.ts";

const scriptsDir = fromFileUrl(new URL("../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "moneymoneyExists.applescript");

export async function isInstalled(): Promise<boolean> {
  return (await osascript(scriptPath)).trim() === "true";
}
