export class MoneyMoneyDatabaseLockedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function isMoneyMoneyDatabaseLocked(stdError: string): boolean {
  return stdError.includes("Locked database. (-2720)");
}

export async function handleMoneyMoneyLocked<T>(
  fn: () => Promise<T>,
  onLocked: () => Promise<void>,
): Promise<T> {
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof MoneyMoneyDatabaseLockedError) {
        await onLocked();
      } else {
        throw error;
      }
    }
  }
}
