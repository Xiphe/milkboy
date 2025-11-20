import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { mockSession, restore, stub } from "@std/testing/mock";
import { getAccounts } from "./index.ts";

describe("getAccounts", () => {
  let session = 0;
  beforeEach(() => {
    session = mockSession();
  });
  afterEach(() => {
    restore(session);
  });

  it("loads and parses accounts from MoneyMoney", async () => {
    stub(Deno, "Command", () => ({
      output() {
        return {
          code: 0,
          stdout: new TextEncoder().encode(`<?xml version="1.0"?>
            <plist version="1.0">
              <array>
                <dict>
                  <key>uuid</key><string>account-uuid-1</string>
                  <key>name</key><string>Test Account</string>
                  <key>accountNumber</key><string>12345</string>
                  <key>currency</key><string>EUR</string>
                  <key>group</key><false/>
                  <key>indentation</key><integer>0</integer>
                  <key>portfolio</key><false/>
                  <key>balance</key>
                  <array>
                    <array>
                      <real>1000.5</real>
                      <string>EUR</string>
                    </array>
                  </array>
                  <key>icon</key><data>iVBORw0KGgo=</data>
                  <key>attributes</key>
                  <dict>
                    <key>bankName</key><string>Test Bank</string>
                    <key>bic</key><string>TEST123</string>
                  </dict>
                  <key>bankCode</key><string>0000</string>
                  <key>owner</key><string>John Doe</string>
                  <key>refreshTimestamp</key><date>2024-01-01T00:00:00Z</date>
                  <key>type</key><string>Giro account</string>
                </dict>
              </array>
            </plist>
          `),
          stderr: new TextEncoder().encode(""),
        };
      },
    }));

    const accounts = await getAccounts();
    assertEquals(accounts.length, 1);
    assertEquals(accounts[0], {
      uuid: "account-uuid-1",
      name: "Test Account",
      attributes: {
        bankName: "Test Bank",
        bic: "TEST123",
      },
      balance: [[1000.5, "EUR"]],
      refreshTimestamp: new Date("2024-01-01T00:00:00Z"),
      accountNumber: "12345",
      currency: "EUR",
      group: false,
      indentation: 0,
      portfolio: false,
      icon: "data:image/png;base64,iVBORw0KGgo=",
      bankCode: "0000",
      owner: "John Doe",
      type: "Giro account",
    });
  });
});
