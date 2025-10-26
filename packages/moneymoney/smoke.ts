import {
  handleMoneyMoneyLocked,
  OsaScriptError,
  getTransactions,
  retry,
} from "./mod.ts";

try {
  const transactions = await handleMoneyMoneyLocked(
    getTransactions,
    retry(5, notifyLockedAndWaitForSpaceKey),
  );
  console.log(transactions);
} catch (error) {
  handleError(error);
  Deno.exit(1);
}

function handleError(error: unknown) {
  if (error instanceof OsaScriptError) {
    console.error(
      "osascript failed (code: ",
      error.code,
      ")\n---\n",
      error.stderr,
      "\n---\n",
    );
  } else {
    console.error("An unexpected error occurred\n---\n", error, "\n---\n");
  }
}

function notifyLockedAndWaitForSpaceKey() {
  console.log(
    "MoneyMoney Database is locked\n" +
      "Please unlock the database and then press space to continue.",
  );

  return new Promise<void>((resolve) => {
    Deno.stdin.setRaw(true, { cbreak: true });

    const buffer = new Uint8Array(1);
    const readLoop = async () => {
      if ((await Deno.stdin.read(buffer)) === null) return;

      if (buffer[0] === 32) {
        Deno.stdin.setRaw(false);
        console.log("Retrying...");
        resolve();
      } else {
        readLoop();
      }
    };
    readLoop();
  });
}
