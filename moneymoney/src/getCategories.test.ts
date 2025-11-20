import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { mockSession, restore, stub } from "@std/testing/mock";
import { getCategories } from "./index.ts";

describe("getCategories", () => {
  let session = 0;
  beforeEach(() => {
    session = mockSession();
  });
  afterEach(() => {
    restore(session);
  });

  it("loads and parses categories from MoneyMoney", async () => {
    stub(Deno, "Command", () => ({
      output() {
        return {
          code: 0,
          stdout: new TextEncoder().encode(`<?xml version="1.0"?>
            <plist version="1.0">
              <array>
                <dict>
                  <key>uuid</key><string>category-uuid-1</string>
                  <key>name</key><string>Groceries</string>
                  <key>currency</key><string>EUR</string>
                  <key>default</key><false/>
                  <key>group</key><false/>
                  <key>indentation</key><integer>0</integer>
                  <key>budget</key>
                  <dict>
                    <key>amount</key><real>500</real>
                    <key>available</key><real>250</real>
                    <key>period</key><string>monthly</string>
                  </dict>
                  <key>icon</key><data>iVBORw0KGgo=</data>
                </dict>
              </array>
            </plist>
          `),
          stderr: new TextEncoder().encode(""),
        };
      },
    }));

    const categories = await getCategories();
    assertEquals(categories.length, 1);
    assertEquals(categories[0], {
      name: "Groceries",
      budget: {
        amount: 500,
        available: 250,
        period: "monthly",
      },
      currency: "EUR",
      default: false,
      group: false,
      icon: "data:image/png;base64,iVBORw0KGgo=",
      indentation: 0,
      uuid: "category-uuid-1",
    });
  });
});
