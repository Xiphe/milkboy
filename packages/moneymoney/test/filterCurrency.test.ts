import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { filterCurrency } from "../src/index.ts";

interface TestItem {
  currency: string;
  name: string;
}

describe("filterCurrency", () => {
  it("filters items by currency and returns both arrays", () => {
    const items: TestItem[] = [
      { currency: "EUR", name: "Item 1" },
      { currency: "USD", name: "Item 2" },
      { currency: "EUR", name: "Item 3" },
      { currency: "GBP", name: "Item 4" },
    ];

    const [eurItems, otherItems] = filterCurrency(items, "EUR");

    assertEquals(eurItems.length, 2);
    assertEquals(eurItems[0].name, "Item 1");
    assertEquals(eurItems[1].name, "Item 3");

    assertEquals(otherItems.length, 2);
    assertEquals(otherItems[0].name, "Item 2");
    assertEquals(otherItems[1].name, "Item 4");
  });

  it("returns empty arrays when no items match", () => {
    const items: TestItem[] = [
      { currency: "USD", name: "Item 1" },
      { currency: "GBP", name: "Item 2" },
    ];

    const [eurItems, otherItems] = filterCurrency(items, "EUR");

    assertEquals(eurItems.length, 0);
    assertEquals(otherItems.length, 2);
  });

  it("returns all items in withCurrency when all match", () => {
    const items: TestItem[] = [
      { currency: "EUR", name: "Item 1" },
      { currency: "EUR", name: "Item 2" },
    ];

    const [eurItems, otherItems] = filterCurrency(items, "EUR");

    assertEquals(eurItems.length, 2);
    assertEquals(otherItems.length, 0);
  });

  it("returns empty arrays for empty input", () => {
    const [eurItems, otherItems] = filterCurrency([], "EUR");

    assertEquals(eurItems.length, 0);
    assertEquals(otherItems.length, 0);
  });
});
