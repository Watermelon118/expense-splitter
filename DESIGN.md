# Expense Splitter Take-home Design Document

## 1. Project Overview

This project is a small frontend web app for splitting shared expenses within an activity, such as a trip, group dinner, or event.

The app allows a user to:

* Create an activity, for example `Queenstown Trip`.
* Add people to the activity.
* Remove accidentally added people when safe.
* Record expenses, including who paid, how much, and what the expense was for.
* View each person's current balance.
* View clear settlement suggestions showing who should pay whom.

The project is intentionally frontend-only and runs locally from a clean checkout. Data is stored in the browser using `localStorage` to provide lightweight persistence without adding backend complexity.

---

## 2. Goals

### Primary goals

1. Build a clean and usable local web app.
2. Correctly calculate balances for shared expenses.
3. Generate clear settlement instructions.
4. Keep settlement logic separate from UI code.
5. Make the core calculation logic unit-testable.
6. Keep the scope realistic for a take-home task.

### Non-goals

The project does not include:

* User registration or login.
* Backend API.
* Database integration.
* Multi-user collaboration.
* Cloud deployment.
* Payment integration.
* Real-time sync.
* Multi-currency support.
* Unequal split support.

These are intentionally excluded to keep the project focused on the core frontend and settlement logic.

---

## 3. Tech Stack

Implemented stack:

* React
* TypeScript
* Vite
* Vitest
* Plain CSS

Reasoning:

* React and TypeScript are appropriate for a frontend take-home task.
* Vite keeps setup lightweight and fast.
* TypeScript makes the data model and calculation logic safer.
* Vitest allows the money and settlement logic to be tested independently from the UI.

---

## 4. User Flow

### 4.1 First Load

When the user opens the app with no saved browser data, they see:

* An empty Activities sidebar.
* A `New activity` button.
* An empty detail panel explaining that they should create an activity first.

### 4.2 Activity List

When activities exist, the sidebar shows saved activities from `localStorage`.

Each activity card shows:

* Activity name.
* Number of people.
* Number of expenses.
* Total amount spent.
* Last updated date.

Example:

```text
Queenstown Trip
4 people | 3 expenses | Total $1,000.00
Updated 19 Jun 2026
```

Actions:

* Select an activity.
* Create a new activity.

### 4.3 Create Activity

The user enters an activity name:

```text
Activity name: Queenstown Trip
```

After creation, the app selects the new activity and shows the activity detail panel.

Validation:

* Activity name is required.
* Activity name cannot be empty after trimming whitespace.

### 4.4 Activity Detail Page

The activity detail page contains four main sections:

1. People
2. Expenses
3. Balances
4. Settlement

---

## 5. Core Features

## 5.1 Add People

The user can add people one by one.

Example:

```text
A
B
C
D
```

Validation:

* Name is required.
* Name cannot be only whitespace.
* Duplicate names within the same activity are prevented case-insensitively.

Example error:

```text
Alex is already in this activity.
```

---

## 5.2 Remove People

The user can remove accidentally added people from edit mode.

If `E` was added by mistake and has not paid any expense, the user can click `Edit` in the People section and remove `E` with the minus button.

### Removal Rule

A person can be removed only if they are not used as the payer of any recorded expense.

Reason:

If `A` paid for Hotel and the app removes `A`, the expense would reference a missing payer. This creates invalid data.

### Behavior

If a person has not paid any expense:

```text
Click Edit, then remove the person with the minus button.
```

Allowed.

If a person has paid one or more expenses:

```text
A cannot be removed because they are linked to existing expenses.
```

Blocked.

All expenses are split equally across the current activity members. If an unpaid person is removed, balances and settlement suggestions are recalculated automatically using the remaining members.

---

## 5.3 Add Expenses

The user can add an expense with:

* Description
* Amount
* Paid by

Example:

```text
Description: Hotel
Amount: 300
Paid by: A
```

For the MVP, every expense is split equally across all current people in the activity.

Validation:

* There must be at least two people before adding expenses.
* Description is required.
* Amount is required.
* Amount must be greater than 0.
* Amount can have up to two decimal places.
* Payer must be selected.

---

## 5.4 Delete Expenses

The user can delete an expense from edit mode if it was entered incorrectly.

Example:

```text
Hotel - A paid $300.00 - remove with the minus button
```

After deleting an expense, balances and settlement suggestions update automatically.

---

## 5.5 Current Balances

The app displays each person's current balance.

Current balance means:

```text
amount paid by this person - fair share owed by this person
```

Example:

```text
A paid Hotel $300
B paid Fuel $200
C paid Car Rental $500
D paid nothing
```

Total:

```text
300 + 200 + 500 = 1000
```

Four people split equally:

```text
1000 / 4 = 250 each
```

Balances:

```text
A: paid 300, should pay 250, balance +50
B: paid 200, should pay 250, balance -50
C: paid 500, should pay 250, balance +250
D: paid 0, should pay 250, balance -250
```

Display:

```text
A is owed $50.00
B owes $50.00
C is owed $250.00
D owes $250.00
```

If a person's balance is 0:

```text
A is settled up
```

---

## 5.6 Settlement Suggestions

The app shows settlement suggestions directly in the Settlement panel.

Example:

```text
D pays C $250.00
B pays A $50.00
```

The goal is to convert balances into clear instructions so the group can settle up.

If no payments are needed:

```text
Everyone is settled up.
```

The settlement panel also shows the number of suggested transfers. The calculation comes from pure utility functions and does not depend on the UI.

---

## 6. Data Model

## 6.1 Activity

```ts
export type Activity = {
  id: string;
  name: string;
  people: Person[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
};
```

---

## 6.2 Person

```ts
export type Person = {
  id: string;
  name: string;
};
```

---

## 6.3 Expense

```ts
export type Expense = {
  id: string;
  description: string;
  amountCents: number;
  paidByPersonId: string;
  createdAt: string;
};
```

Important:

Amounts are stored internally in cents to reduce floating point precision issues.

Example:

```text
$10.99 => 1099 cents
```

---

## 6.4 Balance

```ts
export type Balance = {
  personId: string;
  amountCents: number;
};
```

Meaning:

* Positive amount: this person is owed money.
* Negative amount: this person owes money.
* Zero: this person is settled.

---

## 6.5 Settlement

```ts
export type Settlement = {
  fromPersonId: string;
  toPersonId: string;
  amountCents: number;
};
```

Meaning:

```text
fromPersonId pays toPersonId amountCents
```

---

## 7. Money Utilities

The app keeps amount parsing and formatting separate from React components.

Recommended file:

```text
src/utils/money.ts
```

Functions:

```ts
export function parseAmountToCents(input: string): number | null;
export function formatCents(amountCents: number): string;
```

Behavior:

* Accept whole dollar amounts, for example `10`.
* Accept one or two decimal places, for example `10.5` and `10.99`.
* Reject empty, zero, negative, non-numeric, and more-than-two-decimal inputs.
* Format cents as dollar strings, for example `1099 => $10.99`.

---

## 8. Settlement Logic

The settlement logic is implemented separately from React components.

Recommended file:

```text
src/utils/settlement.ts
```

Functions:

```ts
export function calculateBalances(
  people: Person[],
  expenses: Expense[],
): Balance[];

export function calculateSettlements(
  balances: Balance[],
): Settlement[];
```

---

## 8.1 Balance Calculation

For each expense:

1. Add the full amount to the payer's balance.
2. Subtract each person's fair share from every current activity member.

Formula:

```text
balance = totalPaid - fairShare
```

Because amounts are stored as cents, splitting may create remainders.

Example:

```text
100 cents / 3 people = 33 cents each with 1 cent remainder
```

Implemented handling:

* Divide using integer cents.
* Distribute the remainder one cent at a time to the first people in stable order.

Example:

```text
100 cents split across A, B, C
A owes 34
B owes 33
C owes 33
```

This keeps the total exact.

---

## 8.2 Settlement Calculation

Algorithm:

1. Separate balances into debtors and creditors.
2. Debtors have negative balances.
3. Creditors have positive balances.
4. Match debtors to creditors using two pointers.
5. Each transfer amount is the smaller of:

   * debtor remaining amount
   * creditor remaining amount

Pseudo-code:

```text
debtors = people with balance < 0
creditors = people with balance > 0

while debtors and creditors remain:
  debtor pays creditor min(debt, credit)
  reduce debtor debt
  reduce creditor credit
```

Example:

```text
A +50
B -50
C +250
D -250
```

Possible settlement:

```text
B pays A $50.00
D pays C $250.00
```

---

## 9. Local Storage

The app persists activities using browser `localStorage`.

Storage keys:

```ts
const ACTIVITIES_STORAGE_KEY = "expense-splitter.activities";
const CURRENT_ACTIVITY_STORAGE_KEY = "expense-splitter.currentActivity";
const SELECTED_ACTIVITY_STORAGE_KEY = "expense-splitter.selectedActivityId";
```

Utility file:

```text
src/utils/storage.ts
```

Functions:

```ts
export function loadActivities(fallbackActivities: Activity[]): Activity[];
export function saveActivities(activities: Activity[]): void;
export function loadSelectedActivityId(fallbackActivityId: string): string;
export function saveSelectedActivityId(activityId: string): void;
```

Behavior:

* On app load, read activities from localStorage.
* On activity create/update, save activities back to localStorage.
* Store the selected activity id separately.
* Keep a migration fallback for the earlier single-activity storage key.
* If localStorage is empty, show an empty state.
* If localStorage data is invalid, fail safely and start with an empty list.

---

## 10. File Structure

```text
expense-splitter/
|-- README.md
|-- DESIGN.md
|-- PROGRESS.md
|-- submission-answers.txt
|-- package.json
|-- package-lock.json
|-- vite.config.ts
|-- index.html
|-- public/
|   `-- favicon.svg
`-- src/
    |-- main.tsx
    |-- App.tsx
    |-- App.css
    |-- index.css
    |-- types.ts
    `-- utils/
        |-- money.ts
        |-- money.test.ts
        |-- settlement.ts
        |-- settlement.test.ts
        `-- storage.ts
```

The current implementation keeps UI state in `App.tsx`. This is acceptable for the MVP because the app is small and the calculation/storage logic is already separated into utility modules.

---

## 11. UI Layout

## 11.1 Overall Layout

The app uses a two-column workspace:

```text
Header
[ New activity ]

Activities sidebar | Selected activity detail
```

The sidebar contains:

* Saved activity cards.
* Activity creation form when `New activity` is active.
* Empty state when there are no activities.

The detail panel contains:

* Activity name and total spent.
* People panel.
* Expenses panel.
* Balances panel.
* Settlement panel.

## 11.2 Empty State

When no activity exists:

```text
No activity yet
Create your first activity to add people, record expenses, and see settlement suggestions.
```

## 11.3 Activity Detail Example

```text
Current activity
Queenstown Trip
Total spent $1,000.00

People
[ Edit ]
[ Name input ] [ Add ]
A
B
C
D

Expenses
[ Edit ]
[ Description input ] [ Amount input ] [ Paid by dropdown ] [ Add expense ]
Hotel       A paid $300.00
Fuel        B paid $200.00
Car Rental  C paid $500.00

Balances
A is owed $50.00
B owes $50.00
C is owed $250.00
D owes $250.00

Settlement
2 transfers
B pays A $50.00
D pays C $250.00
```

Remove and delete controls are hidden by default and shown only after clicking the relevant `Edit` button.

---

## 12. Validation and Edge Cases

## 12.1 No activities

Show an empty Activities sidebar and an empty detail state.

## 12.2 No people in an activity

The expense form remains visible, but submitting an expense shows:

```text
Add at least two people before recording expenses.
```

## 12.3 Only one person

Submitting an expense shows:

```text
Add at least two people before recording expenses.
```

## 12.4 Duplicate person name

Prevent duplicate names in the same activity.

## 12.5 Invalid amount

Reject:

* Empty amount
* Zero
* Negative amount
* Non-numeric input
* More than two decimal places

## 12.6 Remove payer

If a person has paid any expense, block removal.

## 12.7 Delete expense

Allow deletion from edit mode and recalculate balances immediately.

## 12.8 No expenses

Show:

```text
No expenses recorded yet.
```

Balances are shown as settled up for existing people. If there are no people, the balance list is empty.

## 12.9 Already settled

If all balances are zero, show:

```text
Everyone is settled up.
```

---

## 13. Unit Tests

Test files:

```text
src/utils/money.test.ts
src/utils/settlement.test.ts
```

Covered behavior:

* Parse whole dollar and decimal amounts into cents.
* Reject invalid or non-positive amounts.
* Format cents as dollar amounts.
* Split one payer expense equally.
* Handle multiple payers.
* Return zero balances when there are no expenses.
* Keep total balances at zero when cents do not split evenly.
* Create settlement suggestions from balances.
* Return no settlements when everyone is settled.
