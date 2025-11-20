/**
 * MoneyMoney database locked error
 * thrown when the MoneyMoney database is locked
 *
 * @example
 * ```typescript
 * import { MoneyMoneyDatabaseLockedError } from "@xph/moneymoney";
 *
 * const error = new MoneyMoneyDatabaseLockedError("Details...");
 * ```
 */
export class MoneyMoneyDatabaseLockedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Helper to check if a stdError output is indicating a locked database
 *
 * @param stdError - The stderr output from osascript
 * @returns {boolean} True if the database is locked, false otherwise
 *
 * @example
 * ```typescript
 * import { isMoneyMoneyDatabaseLocked } from "@xph/moneymoney";
 *
 * const isLocked = isMoneyMoneyDatabaseLocked("Locked database. (-2720)");
 * ```
 */
export function isMoneyMoneyDatabaseLocked(stdError: string): boolean {
  return stdError.includes("Locked database. (-2720)");
}

/**
 * Utility to allow user to unlock the database and retry the operation
 * @param fn - The function to execute
 * @param onLocked - The function to call when the database is locked
 * @returns {Promise<T>} The result of the function
 * @throws {unknown} If any function throws the error is passed through
 *
 * @example
 * ```typescript
 * import { getAccounts, handleMoneyMoneyLocked } from "@xph/moneymoney";
 *
 * const accounts = await handleMoneyMoneyLocked(getAccounts, async () => {
 *   console.log("MoneyMoney Database is locked...");
 *   await askUserToUnlockDatabase();
 * });
 * ```
 */
export async function handleMoneyMoneyLocked<T>(
  fn: () => Promise<T>,
  onLocked: (id: symbol) => Promise<void>,
): Promise<T> {
  const id = Symbol();

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof MoneyMoneyDatabaseLockedError) {
        await onLocked(id);
      } else {
        throw error;
      }
    }
  }
}
