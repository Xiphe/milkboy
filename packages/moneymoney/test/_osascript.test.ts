import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertRejects } from "@std/assert";
import { mockSession, restore, stub } from "@std/testing/mock";
import { MoneyMoneyDatabaseLockedError } from "../src/index.ts";
import { osascript } from "../src/_osascript.ts";

describe("osascript", () => {
  let session = 0;
  beforeEach(() => {
    session = mockSession();
  });
  afterEach(() => {
    restore(session);
  });

  it("throws DatabaseLockedError when the database is locked", async () => {
    stub(Deno, "Command", () => ({
      output() {
        return {
          code: 1,
          stdout: new TextEncoder().encode(""),
          stderr: new TextEncoder().encode("Locked database. (-2720)"),
        };
      },
    }));

    await assertRejects(
      () => osascript("test.applescript"),
      MoneyMoneyDatabaseLockedError,
    );
  });
});
