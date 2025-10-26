import { fromFileUrl, join } from "@std/path";
import { parse as parsePlist } from "plist";
import { osascript } from "../_osascript.ts";
import { type Transactions, TransactionsExportSchema } from "./Transaction.ts";

const scriptsDir = fromFileUrl(new URL("../../scripts", import.meta.url));
const scriptPath = join(scriptsDir, "exportTransactions.applescript");

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
