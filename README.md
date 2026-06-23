# Expense Splitter

A small React + TypeScript expense splitting app built for the Youtap frontend take-home exercise.

The app lets a user create activities, add people, record shared expenses, and see a clear settlement summary showing who should pay whom.

## Tech Stack

- React
- TypeScript
- Vite
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite will print the local URL, usually:

```bash
http://localhost:5173/
```

## Useful Commands

Run unit tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## What Is Implemented

- Create and switch between activities.
- Add people to an activity.
- Record expenses with description, amount, and payer.
- Split each expense equally across all people in the activity.
- Show live balances for each person.
- Show settlement instructions, for example "Alex pays Sam $12.50".
- Persist activities in browser local storage.
- Keep money parsing, balance calculation, and settlement logic outside the UI.
- Unit test the core money and settlement utilities.

## Assumptions

- All expenses are split equally across everyone in the activity.
- Amounts are entered in dollars and stored internally as integer cents.
- The app is frontend-only; browser local storage is enough for this exercise.
- Removing a person is blocked if they have paid an expense, so existing expense history cannot silently become invalid.
- Multi-currency, unequal splits, authentication, and backend sync are outside the intended scope.

## Submission Answers

### 1. Workflow

I started by reading the take-home brief and design notes, then defined the domain model before building UI. The core path was:

1. Scaffold a Vite React TypeScript app.
2. Define activity, person, expense, balance, and settlement types.
3. Implement money parsing/formatting and settlement calculation as pure utilities.
4. Add unit tests around the calculation logic.
5. Build the UI in small steps: static layout, live data rendering, forms, persistence, then multiple activities.
6. Polish the interaction details and remove confusing controls.

### 2. Tools Used

I used Vite, React, TypeScript, Vitest, ESLint, and Git. I also used AI assistance to plan the implementation, review the brief, generate first-pass code, explain tradeoffs, and check for gaps against the requirements.

AI was used as a development assistant, not as a replacement for verification: the settlement logic is isolated, covered by unit tests, and checked through the running app.

### 3. Assumptions

The main product assumption is that every expense is shared equally by the whole group. That matches the wording of the brief and keeps the first version focused on correctness and clarity.

I also assumed the app does not need accounts, backend storage, editing historical expenses, or advanced split rules for this take-home scope.

### 4. If I Had Another Day

I would add editable expenses, activity deletion, stronger empty/error states, browser-level tests for the main user flow, and optional unequal split support. I would also improve accessibility checks and add import/export so users can back up local data.

## Project Notes

The calculation logic lives in `src/utils/settlement.ts` and `src/utils/money.ts`. These files are intentionally independent from React so they can be tested and reasoned about separately from the UI.
