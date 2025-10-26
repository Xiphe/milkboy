import { fromFileUrl, join } from "@std/path";
import { osascript } from "../_osascript.ts";
import { parse as parsePlist } from "plist";
import { type Accounts, AccountsSchema } from "./Account.ts";

const scriptsDir = fromFileUrl(new URL("../../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "exportAccounts.applescript");

export async function getAccounts(): Promise<Accounts> {
  return AccountsSchema.parse(parsePlist(await osascript(scriptPath)));
}
