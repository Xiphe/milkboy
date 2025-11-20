import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { mockSession, restore, stub } from "@std/testing/mock";
import { getTransactions } from "./index.ts";

describe("getTransactions", () => {
  let session = 0;
  beforeEach(() => {
    session = mockSession();
  });
  afterEach(() => {
    restore(session);
  });

  it("loads and parses transactions from MoneyMoney", async () => {
    stub(Deno, "Command", () => ({
      output() {
        return {
          code: 0,
          stdout: new TextEncoder().encode(`<?xml version="1.0"?>
            <plist version="1.0">
              <dict>
                <key>creator</key><string>MoneyMoney</string>
                <key>transactions</key>
                <array>
                  <dict>
                    <key>accountUuid</key><string>account-uuid-1</string>
                    <key>amount</key><real>-50.25</real>
                    <key>booked</key><true/>
                    <key>bookingDate</key><date>2024-01-15T00:00:00Z</date>
                    <key>categoryUuid</key><string>category-uuid-1</string>
                    <key>checkmark</key><false/>
                    <key>currency</key><string>EUR</string>
                    <key>id</key><integer>1</integer>
                    <key>name</key><string>Test Transaction</string>
                    <key>purpose</key><string>Payment for services</string>
                    <key>valueDate</key><date>2024-01-15T00:00:00Z</date>
                    <key>endToEndReference</key><string>12es</string>
                    <key>bookingText</key><string>Booking Text</string>
                  </dict>
                </array>
              </dict>
            </plist>
          `),
          stderr: new TextEncoder().encode(""),
        };
      },
    }));

    const transactions = await getTransactions("12345", new Date("2024-01-01"));
    assertEquals(transactions.length, 1);
    assertEquals(transactions[0], {
      accountUuid: "account-uuid-1",
      amount: -50.25,
      booked: true,
      bookingDate: new Date("2024-01-15T00:00:00Z"),
      categoryUuid: "category-uuid-1",
      checkmark: false,
      currency: "EUR",
      id: 1,
      endToEndReference: "12es",
      bookingText: "Booking Text",
      name: "Test Transaction",
      purpose: "Payment for services",
      valueDate: new Date("2024-01-15T00:00:00Z"),
    });
  });
});
