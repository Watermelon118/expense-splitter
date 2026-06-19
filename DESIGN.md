# Expense Splitter Take-home Design Document

## 1. Project Overview

This project is a small frontend web app for splitting shared expenses within an activity, such as a trip, group dinner, or event.

The app allows a user to:

* Create an activity, for example `Queenstown Trip`.
* Add people to the activity.
* Remove accidentally added people when safe.
* Record expenses, including who paid, how much, and what the expense was for.
* View each person’s current balance.
* Generate clear settlement suggestions showing who should pay whom.

The project is intentionally frontend-only and runs locally from a clean checkout. Data is stored in the browser using `localStorage` to provide lightweight persistence without adding backend complexity.

---

## 2. Goals

### Primary goals

1. Build a clean and usable local web app.
2. Correctly calculate balances for shared expenses.
3. Generate clear settlement instructions.
4. Keep settlement logic separate from UI code.
5. Make the core calculation logic unit-testable.
6. Keep the scope realistic for a four-hour take-home task.

### Non-goals

The project will not include:

* User registration or login.
* Backend API.
* Database integration.
* Multi-user collaboration.
* Cloud deployment.
* Payment integration.
* Real-time sync.
* Multi-currency support.
* Unequal split support in the initial version.

These are intentionally excluded to keep the project focused on the core frontend and settlement logic.

---

## 3. Tech Stack

Recommended stack:

* React
* TypeScript
* Vite
* Vitest
* Plain CSS or CSS modules

Reasoning:

* React and TypeScript are common and appropriate for a New Zealand frontend role.
* Vite keeps setup lightweight and fast.
* TypeScript makes the data model and calculation logic safer.
* Vitest allows the settlement logic to be tested independently from the UI.

---

## 4. User Flow

### 4.1 Home Page

When the user opens the app, they see:

* A list of previous activities stored in `localStorage`.
* A button to create a new activity.

Each activity card should show:

* Activity name.
* Number of people.
* Number of expenses.
* Total amount spent.
* Last updated time.

Example:

```text
Queenstown Trip
4 people · 3 expenses · Total $1,000.00
Last updated: 2026-06-19
```

Actions:

* Open activity.
* Create new activity.
* Optionally delete activity if time allows.

---

### 4.2 Create Activity

The user enters an activity name:

```text
Activity name: Queenstown Trip
```

After creation, the app navigates to the activity detail page.

Validation:

* Activity name is required.
* Activity name should not be empty after trimming whitespace.

---

### 4.3 Activity Detail Page

The activity detail page contains four main sections:

1. People
2. Expenses
3. Current balances
4. Settlement suggestions

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
* Duplicate names within the same activity should be prevented or warned against.

Recommended behavior:

```text
"Alex" already exists in this activity.
```

---

## 5.2 Remove People

The user can remove accidentally added people.

Example:

```text
A
B
C
D
E
```

If `E` was added by mistake and has not paid any expense, the user can remove `E`.

### Removal rule

A person can be removed only if they are not used as the payer of any recorded expense.

Reason:

If `A` paid for Hotel and the app removes `A`, the expense would reference a missing payer. This creates invalid data.

### Behavior

If a person has not paid any expense:

```text
Remove E
```

Allowed.

If a person has paid one or more expenses:

```text
A cannot be removed because they are linked to existing expenses. Delete those expenses first.
```

Blocked.

### Important design decision

All expenses are split equally across the current activity members.

Therefore, if an accidentally added unpaid person is removed, the balances are recalculated automatically using the remaining members.

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

Another example:

```text
Description: Fuel
Amount: 200
Paid by: B
```

For the MVP, every expense is split equally across all current people in the activity.

Validation:

* Description is required.
* Amount is required.
* Amount must be greater than 0.
* Payer must be selected.
* There must be at least 2 people before adding expenses.

---

## 5.4 Delete Expenses

The user can delete an expense if it was entered incorrectly.

Example:

```text
Hotel — A paid $300.00 — Delete
```

After deleting an expense, balances and settlement suggestions should update automatically.

Editing expenses is optional. If time is limited, deleting and re-adding is enough for the MVP.

---

## 5.5 Current Balances

The app should display each person’s current balance.

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

If a person’s balance is 0:

```text
A is settled up
```

---

## 5.6 Settlement Suggestions

The user clicks a `Settle` button to view transfer suggestions.

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

Settlement suggestions can be shown in:

* A modal
* A panel below the button
* A simple result card

A modal is acceptable, but the logic should not depend on the modal. The calculation should come from pure utility functions.

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

Amounts should be stored internally in cents to reduce floating point precision issues.

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

## 7. Settlement Logic

The settlement logic should be implemented separately from React components.

Recommended file:

```text
src/utils/settlement.ts
```

Recommended functions:

```ts
export function calculateBalances(
  people: Person[],
  expenses: Expense[]
): Balance[] {
  // implementation
}

export function calculateSettlements(
  balances: Balance[]
): Settlement[] {
  // implementation
}
```

---

## 7.1 Balance Calculation

For each expense:

1. Add the full amount to the payer’s balance.
2. Subtract each person’s fair share from every current activity member.

Formula:

```text
balance = totalPaid - fairShare
```

Because amounts are stored as cents, splitting may create remainders.

Example:

```text
100 cents / 3 people = 33 cents each with 1 cent remainder
```

Recommended simple handling:

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

## 7.2 Settlement Calculation

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

## 8. Local Storage

The app should persist activities using browser `localStorage`.

Storage key:

```ts
const STORAGE_KEY = "expense-splitter.activities";
```

Recommended utility file:

```text
src/utils/storage.ts
```

Functions:

```ts
export function loadActivities(): Activity[] {
  // read from localStorage
}

export function saveActivities(activities: Activity[]): void {
  // save to localStorage
}
```

Behavior:

* On app load, read activities from localStorage.
* On activity create/update/delete, save back to localStorage.
* If localStorage is empty, show an empty state.
* If localStorage data is invalid, fail safely and start with an empty list.

---

## 9. Suggested File Structure

```text
expense-splitter/
├── README.md
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types.ts
│   ├── styles.css
│   ├── components/
│   │   ├── ActivityList.tsx
│   │   ├── ActivityForm.tsx
│   │   ├── ActivityDetail.tsx
│   │   ├── PeopleSection.tsx
│   │   ├── ExpenseSection.tsx
│   │   ├── BalanceSummary.tsx
│   │   └── SettlementSummary.tsx
│   ├── utils/
│   │   ├── money.ts
│   │   ├── settlement.ts
│   │   ├── settlement.test.ts
│   │   └── storage.ts
│   └── hooks/
│       └── useActivities.ts
```

If time is tight, `hooks/useActivities.ts` can be skipped and state can be managed directly in `App.tsx`.

---

## 10. UI Layout

## 10.1 Home Page

Suggested layout:

```text
Expense Splitter

Create a new activity
[ Activity name input ] [ Create ]

Previous activities

[ Queenstown Trip ]
4 people · 3 expenses · Total $1,000.00
[ Open ]

[ Group Dinner ]
5 people · 4 expenses · Total $320.00
[ Open ]
```

Empty state:

```text
No activities yet.
Create your first activity to start splitting expenses.
```

---

## 10.2 Activity Detail Page

Suggested layout:

```text
Queenstown Trip

[ Back to activities ]

People
[ Name input ] [ Add person ]

A [Remove]
B [Remove]
C [Remove]
D [Remove]

Expenses
[ Description input ]
[ Amount input ]
[ Paid by dropdown ]
[ Add expense ]

Hotel — A paid $300.00 [Delete]
Fuel — B paid $200.00 [Delete]
Car Rental — C paid $500.00 [Delete]

Current Balances
A is owed $50.00
B owes $50.00
C is owed $250.00
D owes $250.00

[ Settle ]

Settlement Suggestions
D pays C $250.00
B pays A $50.00
```

---

## 11. Validation and Edge Cases

## 11.1 No activities

Show empty state.

## 11.2 No people in an activity

Show:

```text
Add at least two people before recording expenses.
```

Disable expense form.

## 11.3 Only one person

Show:

```text
At least two people are required to split expenses.
```

Disable expense form.

## 11.4 Duplicate person name

Prevent duplicate names in the same activity.

## 11.5 Invalid amount

Reject:

* Empty amount
* Zero
* Negative amount
* Non-numeric input

## 11.6 Remove payer

If a person has paid any expense, block removal.

## 11.7 Delete expense

Allow deletion and recalculate balances immediately.

## 11.8 No expenses

Show:

```text
No expenses recorded yet.
```

Balances should be zero or hidden until expenses exist.

## 11.9 Already settled

If all balances are zero, show:

```text
Everyone is settled up.
```

---

## 12. Unit Tests

Recommended test file:

```text
src/utils/settlement.test.ts
```

Minimum tests:

### Test 1: One payer, equal split

People:

```text
A, B, C
```

Expense:

```text
A paid $90
```

Expected balances:

```text
A +6000 cents
B -3000 cents
C -3000 cents
```

Expected settlements:

```text
B pays A 3000
C pays A 3000
```

---

### Test 2: Multiple payers

People:

```text
A, B, C, D
```

Expenses:

```text
A paid $300
B paid $200
C paid $500
```

Expected balances:

```text
A +5000
B -5000
C +25000
D -25000
```

Expected total settlement amount:

```text
30000 cents
```

---

### Test 3: No expenses

Expected:

```text
All balances are 0
No settlements
```

---

### Test 4: Already settled

People:

```text
A, B
```

Expenses:

```text
A paid $50
B paid $50
```

Expected:

```text
A 0
B 0
No settlements
```

---

### Test 5: Rounding cents

People:

```text
A, B, C
```

Expense:

```text
A paid $1.00
```

Expected:

```text
The total balances should sum to 0 exactly.
No cents should disappear due to rounding.
```

---

## 13. README Content

The README should include:

````md
# Expense Splitter

A small frontend web app for splitting shared expenses within an activity such as a trip or group dinner.

## Tech Stack

- React
- TypeScript
- Vite
- Vitest

## Getting Started

```bash
npm install
npm run dev
````

## Run Tests

```bash
npm test
```

## Product Decisions

The app is modelled around activities because shared expenses usually belong to a specific trip, dinner, or event.

The app is frontend-only and uses localStorage for lightweight persistence. I avoided backend storage, authentication, and deployment because the brief asks for a locally runnable frontend web app and the four-hour time limit makes scope control important.

All expenses are split equally across the current activity members. This matches the minimum requirement in the brief and keeps the initial version focused on the core settlement logic.

## Assumptions

* Each expense is split equally across all current activity members.
* Amounts are stored in cents internally.
* A person cannot be removed if they are the payer of an existing expense.
* Data is stored locally in the browser and is not synced across devices.
* No authentication or backend is included.

## What I Would Improve With More Time

* Custom split participants per expense.
* Unequal split amounts or percentages.
* Editing expenses and people.
* Better accessibility and keyboard navigation.
* Exporting or sharing settlement results.
* Backend support only if cross-device access or collaboration became a product requirement.

```

---

## 14. Written Answers for Submission

## 14.1 What was your workflow?

I started by identifying the core requirement: calculating shared expense balances correctly and turning them into clear settlement instructions. I modelled the app around an activity such as a trip or dinner, then designed the data structures and settlement algorithm before building the UI. I kept the calculation logic separate from React components so it could be unit-tested independently.

---

## 14.2 What tools did you use?

I used React, TypeScript, Vite, and Vitest. I also used AI tools as a planning and review aid: first to clarify the scope for a four-hour take-home, then to sanity-check the data model, settlement logic, and README structure. The final implementation decisions and code review were done by me.

---

## 14.3 What assumptions did you make?

I assumed each expense is split equally across all current members of the activity, since the brief only requires shared group expenses at minimum. I also assumed there is no need for accounts, authentication, backend storage, or multi-currency support. Data is stored locally in the browser using localStorage, which keeps the app frontend-only while still preserving activity history between sessions.

---

## 14.4 If you had another day, what would you add or improve?

I would add custom split participants per expense, unequal splits by amount or percentage, editing for people and expenses, stronger accessibility support, and more tests around rounding edge cases. I would only add a backend if the product needed cross-device access, shared links, or real-time collaboration.

---

## 15. Implementation Priority

To stay within four hours, implementation should follow this order:

1. Define TypeScript types.
2. Implement settlement logic.
3. Add unit tests for settlement logic.
4. Build home page and activity creation.
5. Build activity detail page.
6. Add people management.
7. Add expense management.
8. Add balance summary.
9. Add settlement suggestions.
10. Add localStorage persistence.
11. Polish UI and README.

If time becomes tight, prioritize:

1. Settlement logic correctness.
2. Clean UI for adding people and expenses.
3. Clear settlement output.
4. README explanation.

LocalStorage and styling are useful, but they should not come at the cost of broken settlement logic.

---

## 16. Final Scope

Final MVP:

- React + TypeScript + Vite frontend web app.
- Activity-based structure.
- Activity history saved in localStorage.
- Add/remove people.
- Add/delete expenses.
- Equal split across all current activity members.
- Current balance summary.
- Settlement suggestions.
- Pure settlement functions.
- Unit tests for settlement logic.
- Clear README with setup instructions and assumptions.

This scope fully addresses the brief while staying realistic for a four-hour take-home project.
```
