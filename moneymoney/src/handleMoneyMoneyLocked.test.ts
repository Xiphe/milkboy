import { assertEquals } from "@std/assert";
import {
  handleMoneyMoneyLocked,
  MoneyMoneyDatabaseLockedError,
} from "./index.ts";
import { describe, it } from "@std/testing/bdd";

describe("handleMoneyMoneyLocked", () => {
  it("retries when the database is locked", async () => {
    let locked = true;
    let i = 0;
    let waitUntilRetryRead = Promise.withResolvers<void>();

    const result = handleMoneyMoneyLocked(
      () => {
        if (locked) {
          throw new MoneyMoneyDatabaseLockedError("Nope");
        }
        return Promise.resolve("success");
      },
      () => {
        i++;
        return waitUntilRetryRead.promise;
      },
    );

    // DB is locked, we are waiting for onLocked to resolve;
    assertEquals(i, 1);

    // Prepare new "blocker"
    const retryRead = waitUntilRetryRead.resolve;
    waitUntilRetryRead = Promise.withResolvers<void>();

    // Resolve first onLocked promise
    retryRead();
    await Promise.resolve(); // tick

    // DB is still locked, we have second invocation of onLocked and wait for
    // it to resolve;
    assertEquals(i, 2);

    // Unlock DB
    locked = false;
    waitUntilRetryRead.resolve(); // retry read

    // DB is unlocked, we resolve the result promise
    assertEquals(await result, "success");
    // No further invocations of onLocked, so i is still 2;
    assertEquals(i, 2);
  });
});
