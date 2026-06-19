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
- Static UI converted to render from activity data and settlement utilities.
- In-memory React state and add forms added for people and expenses.
- Expense deletion and safe person removal added.
- Remove/Delete actions moved behind explicit edit mode controls.
- Remove controls unified as compact edit-mode minus buttons.
- Current activity persistence added with localStorage.
- Activity list selection and new activity creation added.

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

### 8. Render UI From Activity Data

What changed:

- Updated `src/App.tsx` to render from a typed `Activity` object.
- Connected total spending display to expense data.
- Connected balances to `calculateBalances`.
- Connected settlement suggestions to `calculateSettlements`.
- Used `formatCents` for all money display.
- Added neutral and empty-state styling in `src/App.css`.

Decision:

- This step keeps the app read-only but makes the UI data-driven.
- The sample data still matches the design document example, but the displayed balances and settlements now come from the real utility functions.
- Form interactions are intentionally deferred to the next step so data flow can be reviewed separately.

Verification:

- `npm test` passed: 2 test files, 10 tests.
- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed at `http://127.0.0.1:5173/`.
- No browser console warnings or errors were observed.

Useful README/submission material:

- After testing the calculation utilities independently, I connected them to the UI so the displayed summaries come from the same tested logic.
- This reduces duplication between UI examples and business logic.

### 9. Add In-Memory People And Expense Forms

What changed:

- Converted the current activity in `src/App.tsx` into React state.
- Added an Add person form.
- Added an Add expense form with description, amount, and payer selection.
- Connected amount input to `parseAmountToCents`.
- Kept balances and settlement suggestions computed from the updated state.
- Added compact form styling in `src/App.css`.

Current behavior:

- Adding a person updates the people count and recalculates balances.
- Adding an expense updates the expense list, total spending, balances, and settlement suggestions.
- Duplicate person names are blocked.
- Empty person names are blocked.
- Invalid expense description, amount, or payer state is blocked.
- Data is currently in memory only; refreshing the browser resets to the sample activity.

Decision:

- Persistence is intentionally deferred until after the core in-memory workflow works.
- This keeps UI state, settlement logic, and storage concerns separated.

Verification:

- `npm test` passed: 2 test files, 10 tests.
- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed by adding a new person and a new expense.
- No browser console warnings or errors were observed.

Useful README/submission material:

- I built the UI in layers: first a static shell, then data-driven rendering, then in-memory interactions.
- This made it easier to verify that settlement output stays tied to the tested utility functions as the UI becomes interactive.

### 10. Add Delete Expense And Safe Remove Person

What changed:

- Added Remove buttons for people.
- Added Delete buttons for expenses.
- Added accessible button names such as `Remove A` and `Delete Hotel`.
- Added logic that blocks removing a person if they are the payer of any existing expense.
- Deleting an expense recalculates totals, balances, and settlement suggestions immediately.
- Removing an unpaid person recalculates balances across the remaining people immediately.

Decision:

- A person can only be removed when they are not referenced as an expense payer.
- This prevents invalid expense data while still allowing accidentally added unpaid people to be removed.
- If a paid expense is deleted first, the former payer can then be removed.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed:
  - Added and removed unpaid person `E`.
  - Confirmed paid person `A` was blocked while `Hotel` existed.
  - Deleted `Hotel`.
  - Removed `A` after deleting their paid expense.
  - Confirmed total spending updated to `$700.00`.
  - No browser console warnings or errors were observed.

Useful README/submission material:

- I chose to block removing people who are referenced by expenses, because removing a payer would otherwise leave invalid data.
- Deleting an expense is supported as the simple correction path for entered mistakes.

### 11. Hide Destructive Actions Behind Edit Mode

What changed:

- Added edit mode state for the People panel.
- Added edit mode state for the Expenses panel.
- Remove/Delete actions are hidden by default.
- People and Expenses panels now show an `Edit` button that changes to `Done`.
- Added accessible labels such as `Edit people`, `Edit expenses`, and `Delete Fuel`.

Decision:

- Destructive actions should not sit directly beside every name or expense during normal use.
- Hiding Remove/Delete behind an explicit edit mode reduces accidental clicks while keeping correction flows available.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed:
  - Remove/Delete text is not visible by default.
  - Edit buttons reveal Remove/Delete actions.
  - Deleting `Fuel` in edit mode updates total spending to `$800.00`.
  - No browser console warnings or errors were observed.

Useful README/submission material:

- I kept destructive actions available but intentionally gated them behind edit mode to reduce accidental changes.
- This is a small UX decision that supports the correction workflow without making delete actions too prominent.

### 12. Unify Destructive Control UI

What changed:

- Replaced visible People `Remove` text buttons with compact circular minus buttons.
- Replaced Expenses `Delete` text buttons with the same compact circular minus button.
- Kept accessible labels such as `Remove A` and `Delete Fuel`.

Decision:

- People and Expenses now use the same edit-mode deletion pattern.
- Compact icon-style controls keep the UI cleaner and avoid overflowing small person tiles.

Verification:

- `npm test` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed:
  - Remove/Delete text is hidden.
  - Edit mode shows matching 24x24 minus buttons.
  - Deleting an expense still updates totals.
  - No browser console warnings or errors were observed.

Useful README/submission material:

- I adjusted destructive controls after reviewing the UI, keeping the behavior but making the normal view less error-prone and visually consistent.

### 13. Add localStorage Persistence

What changed:

- Added `src/utils/storage.ts`.
- Added `loadActivity(fallbackActivity)`.
- Added `saveActivity(activity)`.
- Connected `App.tsx` to load the current activity from localStorage.
- Connected `App.tsx` to save activity changes to localStorage.
- Added shape checks so invalid stored data falls back to the sample activity.

Decision:

- Persistence is scoped to the current activity for the MVP.
- localStorage keeps the app frontend-only while preserving work after refresh.
- Storage logic lives outside React components so it can be reasoned about separately from UI state.

Verification:

- `npm test` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed:
  - Added a unique person and expense.
  - Reloaded the page.
  - Confirmed the added person and expense persisted.
  - Removed the temporary verification data afterward.
  - No browser console warnings or errors were observed.

Useful README/submission material:

- I used localStorage for lightweight persistence because the brief asks for a locally runnable frontend app and does not require backend storage.
- Invalid stored data is ignored defensively so the app can recover to a known sample activity.

### 14. Add Activity Selection And Creation

What changed:

- Replaced the static Activities sidebar with real activity state.
- Added clickable activity cards.
- Added selected activity state.
- Added a New activity flow with activity name validation.
- Upgraded storage from a single current activity to an activities array plus selected activity id.
- Kept a migration path from the earlier single-activity localStorage key.

Decision:

- The sidebar should not look interactive unless it actually is interactive.
- Creating and selecting activities is part of the intended product model, so it should be implemented before final README work.
- The MVP still keeps activity management modest: create and select are supported, while deleting whole activities can remain a future improvement.

Verification:

- `npm test` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed:
  - New activity opens a creation form.
  - Creating an activity selects it immediately.
  - Activity cards switch the selected detail view.
  - Selected activity persists after reload.
  - Temporary browser test activity was removed after verification.
  - No browser console warnings or errors were observed.

Useful README/submission material:

- I modelled expenses inside activities because shared expenses usually belong to a trip, dinner, or event.
- Activity creation and selection are supported locally, with persistence handled by localStorage.

## Planned Next Steps

1. Replace the default Vite README with project-specific setup and decisions.
2. Add written submission answers.
3. Do a final browser pass and GitHub sync.
