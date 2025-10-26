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
