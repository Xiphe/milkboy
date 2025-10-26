/**
 * Retry utility meant to be used with handleMoneyMoneyLocked to retry an action when the database is locked.
 * @param retries - The number of retries to attempt
 * @param then - An optional handler to call when the retries are exhausted by default it throws
 * @returns A function that can be used as onLocked handler for handleMoneyMoneyLocked
 * @see {handleMoneyMoneyLocked}
 *
 * @example
 * ```typescript
 * import { retry, handleMoneyMoneyLocked, getAccounts } from "@xph/moneymoney";
 *
 * const accounts = await handleMoneyMoneyLocked(
 *  getAccounts,
 *  retry(5, finallyAskUserToUnlockDatabase),
 * );
 * ```
 */
export function retry(
  retries: number = 3,
  then: () => Promise<void> = () => {
    throw new Error(`Giving up on retrying action after ${retries} attempts`);
  },
): (id: symbol) => Promise<void> {
  const retriesLeftMap = new WeakMap<symbol, number>();

  return (id: symbol) => {
    if (!retriesLeftMap.has(id)) {
      retriesLeftMap.set(id, retries);
    }

    const retriesLeft = retriesLeftMap.get(id);
    if (retriesLeft === 0 || typeof retriesLeft !== "number") {
      retriesLeftMap.delete(id);
      return then();
    }

    retriesLeftMap.set(id, retriesLeft - 1);
    return new Promise<void>((resolve) => {
      setTimeout(resolve, retries - retriesLeft * 500);
    });
  };
}
