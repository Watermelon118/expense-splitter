import type { Activity, Expense, Person } from "../types";

const ACTIVITIES_STORAGE_KEY = "expense-splitter.activities";
const CURRENT_ACTIVITY_STORAGE_KEY = "expense-splitter.currentActivity";
const SELECTED_ACTIVITY_STORAGE_KEY = "expense-splitter.selectedActivityId";

export function loadActivities(fallbackActivities: Activity[]): Activity[] {
  try {
    const storedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);

    if (storedActivities) {
      const parsedActivities: unknown = JSON.parse(storedActivities);

      if (isActivityArray(parsedActivities)) {
        return parsedActivities;
      }
    }

    const storedActivity = localStorage.getItem(CURRENT_ACTIVITY_STORAGE_KEY);

    if (storedActivity) {
      const parsedActivity: unknown = JSON.parse(storedActivity);

      if (isActivity(parsedActivity)) {
        return [parsedActivity];
      }
    }

    return fallbackActivities;
  } catch {
    return fallbackActivities;
  }
}

export function saveActivities(activities: Activity[]): void {
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // Persistence is best-effort; the app should still work in memory.
  }
}

export function loadSelectedActivityId(fallbackActivityId: string): string {
  try {
    return (
      localStorage.getItem(SELECTED_ACTIVITY_STORAGE_KEY) ?? fallbackActivityId
    );
  } catch {
    return fallbackActivityId;
  }
}

export function saveSelectedActivityId(activityId: string): void {
  try {
    localStorage.setItem(SELECTED_ACTIVITY_STORAGE_KEY, activityId);
  } catch {
    // Persistence is best-effort; the app should still work in memory.
  }
}

function isActivityArray(value: unknown): value is Activity[] {
  return Array.isArray(value) && value.length > 0 && value.every(isActivity);
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
