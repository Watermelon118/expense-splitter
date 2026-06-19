import type { Activity, Expense, Person } from "../types";

const STORAGE_KEY = "expense-splitter.currentActivity";

export function loadActivity(fallbackActivity: Activity): Activity {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return fallbackActivity;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    return isActivity(parsedValue) ? parsedValue : fallbackActivity;
  } catch {
    return fallbackActivity;
  }
}

export function saveActivity(activity: Activity): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activity));
  } catch {
    // Persistence is best-effort; the app should still work in memory.
  }
}

function isActivity(value: unknown): value is Activity {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.people) &&
    value.people.every(isPerson) &&
    Array.isArray(value.expenses) &&
    value.expenses.every(isExpense) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isPerson(value: unknown): value is Person {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.name === "string";
}

function isExpense(value: unknown): value is Expense {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.description === "string" &&
    typeof value.amountCents === "number" &&
    Number.isInteger(value.amountCents) &&
    typeof value.paidByPersonId === "string" &&
    typeof value.createdAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
