import { fromFileUrl, join } from "@std/path";
import { parse as parsePlist } from "plist";
import { osascript } from "../_osascript.ts";
import { CategoriesSchema } from "./Category.ts";

const scriptsDir = fromFileUrl(new URL("../../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "exportCategories.applescript");

export async function getCategories() {
  return CategoriesSchema.parse(parsePlist(await osascript(scriptPath)));
}
