import {
  isMoneyMoneyDatabaseLocked,
  MoneyMoneyDatabaseLockedError,
} from "./handleMoneyMoneyLocked.ts";

/**
 * Specific for non-zero exit codes from osascript
 *
 * @example
 * ```typescript
 * import { OsaScriptError } from "@xph/moneymoney";
 *
 * const error = new OsaScriptError("osascript failed", 1, "stderr");
 * ```
 */
export class OsaScriptError extends Error {
  code: number;
  stderr: string;
  constructor(message: string, code: number, stderr: string) {
    super(message);
    this.stderr = stderr;
    this.code = code;
  }
}

/**
 * Execute an applescript file
 * @param scriptFile - Path to the applescript file
 * @param args - Arguments to pass to the script
 * @returns The stdout output
 */
export async function osascript(
  scriptFile: string,
  ...args: string[]
): Promise<string> {
  const command = new Deno.Command("osascript", {
    args: [scriptFile, ...args],
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    const stderrText = new TextDecoder().decode(stderr);

    if (isMoneyMoneyDatabaseLocked(stderrText)) {
      throw new MoneyMoneyDatabaseLockedError("Database is locked");
    }

    throw new OsaScriptError("osascript failed", code, stderrText);
  }

  const stdoutText = new TextDecoder().decode(stdout);
  if (typeof stdoutText !== "string") {
    throw new Error("Unexpectedly got non-string from osascript stdout");
  }

  return stdoutText;
}
