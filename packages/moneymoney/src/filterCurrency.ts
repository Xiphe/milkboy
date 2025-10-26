/**
 * Filter a list of items by currency
 * returns two arrays: one with items in the specified currency, and one with items in other currencies
 * works with getAccounts, getCategories & getTransactions
 *
 * @example
 * ```typescript
 * import { filterCurrency, getAccounts } from "@xph/moneymoney";
 *
 * const accounts = await getAccounts();
 * const [eurAccounts, otherAccounts] = filterCurrency(accounts, "EUR");
 * ```
 */
export function filterCurrency<T extends { currency: string }>(
  items: T[],
  currency: string,
): [items: T[], itemsInOtherCurrency: T[]] {
  const other: T[] = [];

  const withCurrency: T[] = items.filter((item) => {
    if (item.currency === currency) {
      return true;
    }
    other.push(item);
    return false;
  });

  return [withCurrency, other];
}
