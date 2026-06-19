# Expense Splitter Progress Notes

This document tracks implementation progress, decisions, verification, and material that can later be reused in the README and written submission answers.

## Current Status

- GitHub repository initialized and connected to `https://github.com/Watermelon118/expense-splitter.git`.
- Vite React TypeScript scaffold created.
- Dependencies installed.
- Initial production build verified.
- Vite dev server started at `http://127.0.0.1:5173/`.
- Core TypeScript data models added.
- Money parsing and formatting utilities added.
- Pure settlement calculation utilities added.
- Vitest unit tests added for money and settlement logic.
- Default Vite screen replaced with a static Expense Splitter app shell.

## Step Log

### 1. Read Brief And Design Notes

Files reviewed:

- `expense-splitter-takehome-youtap.pdf`
- `DESIGN.md`

Key understanding:

- The task is a frontend take-home project for splitting shared group expenses.
- The core requirement is to add people, record expenses, and show who owes whom.
- The evaluation focuses on settlement correctness, UI/logic separation, code quality, AI workflow, and clear communication of decisions.
- The expected time budget is no more than 4 hours, so scope control matters.

Useful README/submission material:

- The implementation should prioritize correct settlement logic over broad feature count.
- The app is intentionally frontend-only and locally runnable.
- AI is allowed, but the workflow and decisions should be explained clearly.

### 2. Initialize GitHub Repository

What changed:

- Initialized local git repository on `main`.
- Added `origin` remote pointing to `https://github.com/Watermelon118/expense-splitter.git`.
- Added `.gitignore`.
- Committed and pushed initial planning files.

Files committed:

- `.gitignore`
- `DESIGN.md`

Decision:

- The PDF brief was excluded from git with `.gitignore` to avoid publishing interview-provided material by default.

Verification:

- `main` tracks `origin/main`.
- Initial commit pushed successfully.

Useful README/submission material:

- GitHub was selected as the delivery method instead of a zip file.

### 3. Initialize Vite React TypeScript Project

What changed:

- Created Vite React TypeScript scaffold.
- Installed npm dependencies.
- Renamed package from the temporary scaffold name to `expense-splitter`.
- Added generated dev logs to `.gitignore`.

Important files added:

- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js`
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/App.css`
- `public/`

Verification:

- `npm install` completed successfully.
- `npm run build` passed.
- Vite dev server is running at `http://127.0.0.1:5173/`.

Useful README/submission material:

- Tech stack: React, TypeScript, Vite.
- Local setup commands will be:

```bash
npm install
npm run dev
```

### 4. Define Data Models And Money Utilities

What changed:

- Added core domain types in `src/types.ts`.
- Added money parsing and formatting helpers in `src/utils/money.ts`.

Types added:

- `Person`
- `Expense`
- `Activity`
- `Balance`
- `Settlement`

Decision:

- Expense amounts are stored as integer cents through `amountCents`.
- User-entered decimal strings are parsed at the boundary using `parseAmountToCents`.
- Display formatting is handled by `formatCents`.
- The calculation layer should work with integer cents only, which avoids floating point precision issues.

Current money input rules:

- Accepts whole dollar amounts such as `10`.
- Accepts one or two decimal places such as `10.5` and `10.50`.
- Rejects empty, zero, negative, non-numeric, and values with more than two decimal places.

Verification:

- `npm run build` passed after adding the new files.

Useful README/submission material:

- I modelled money as integer cents internally to avoid floating point precision issues.
- I separated parsing/formatting from settlement calculation so the core logic can stay deterministic and testable.

### 5. Implement Settlement Logic

What changed:

- Added `src/utils/settlement.ts`.
- Implemented `calculateBalances(people, expenses)`.
- Implemented `calculateSettlements(balances)`.

Balance calculation behavior:

- Starts each person at `0` cents.
- For each expense, adds the full expense amount to the payer.
- Splits the expense across all current activity people.
- Uses integer cents only.
- Distributes split remainders one cent at a time in stable people order.
- Returns balances in the same order as the input `people` array.

Settlement calculation behavior:

- Separates negative balances into debtors and positive balances into creditors.
- Uses a two-pointer matching algorithm.
- Creates settlement instructions where one debtor pays one creditor at a time.
- Ignores zero balances.

Decision:

- The settlement logic is a pure utility module and does not depend on React or browser APIs.
- Keeping it outside components makes it easier to unit test and easier to explain in the submission.
- Invalid expenses whose payer is not in the current people list are ignored defensively. The UI should normally prevent that state.

Verification:

- `npm run build` passed after adding settlement logic.

Useful README/submission material:

- The heart of the app is implemented as pure TypeScript functions: one function computes balances, and another turns those balances into settlement instructions.
- Remainder cents are handled explicitly so no money disappears during equal splitting.
- The algorithm favors predictable and testable results over trying to find a unique settlement ordering.

### 6. Add Unit Tests

What changed:

- Installed Vitest as a development dependency.
- Added `npm test` and `npm run test:watch` scripts.
- Added `src/utils/money.test.ts`.
- Added `src/utils/settlement.test.ts`.

Test coverage added:

- Parses whole dollar and decimal amount strings into cents.
- Rejects invalid, zero, negative, and over-precise amount input.
- Formats positive, zero, negative, and large cent values for display.
- Calculates balances for a single payer.
- Calculates balances for multiple payers.
- Returns zero balances when there are no expenses.
- Handles rounding when cents do not split evenly.
- Creates settlement suggestions from balances.
- Returns no settlements when everyone is already settled.

Verification:

- `npm test` passed: 2 test files, 10 tests.
- `npm run build` passed.
- `npm run lint` passed.

Useful README/submission material:

- The core calculation logic is covered by unit tests and can be validated independently from the UI.
- Tests include a rounding case to prove no cents disappear during equal splitting.
- The app has separate scripts for local development, production build, linting, and tests.

### 7. Replace Default Vite Screen With Static App Shell

What changed:

- Replaced the default Vite starter content in `src/App.tsx`.
- Replaced template component styles in `src/App.css`.
- Simplified global styles in `src/index.css`.

UI now shows:

- App header for Expense Splitter.
- Static activity sidebar.
- Static selected activity detail view.
- People, expenses, balances, and settlement preview sections.

Decision:

- This step intentionally does not add business state or form behavior.
- The goal was to make the running app visibly match the take-home domain before wiring interactions.
- The static numbers match the design document example, which keeps the UI aligned with the planned settlement logic.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- Vite dev server still responds at `http://127.0.0.1:5173/`.

Useful README/submission material:

- I first replaced the default scaffold UI with a domain-specific app shell, then planned to connect the already-tested calculation logic to the UI.
- The UI was built around the core user workflow: activity, people, expenses, balances, and settlement suggestions.

## Planned Next Steps

1. Add React state for a single in-memory activity.
2. Add people and expense input flows.
3. Connect balances and settlement suggestions to the tested utility functions.
4. Add localStorage persistence after the basic UI flow works.
