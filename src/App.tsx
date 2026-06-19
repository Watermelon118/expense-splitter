import { type FormEvent, useMemo, useState } from "react";

import type { Activity, Balance, Person, Settlement } from "./types";
import { formatCents, parseAmountToCents } from "./utils/money";
import { calculateBalances, calculateSettlements } from "./utils/settlement";
import "./App.css";

const sampleActivity: Activity = {
  id: "queenstown-trip",
  name: "Queenstown Trip",
  people: [
    { id: "person-a", name: "A" },
    { id: "person-b", name: "B" },
    { id: "person-c", name: "C" },
    { id: "person-d", name: "D" },
  ],
  expenses: [
    {
      id: "hotel",
      description: "Hotel",
      amountCents: 30000,
      paidByPersonId: "person-a",
      createdAt: "2026-06-19T00:00:00.000Z",
    },
    {
      id: "fuel",
      description: "Fuel",
      amountCents: 20000,
      paidByPersonId: "person-b",
      createdAt: "2026-06-19T00:00:00.000Z",
    },
    {
      id: "car-rental",
      description: "Car Rental",
      amountCents: 50000,
      paidByPersonId: "person-c",
      createdAt: "2026-06-19T00:00:00.000Z",
    },
  ],
  createdAt: "2026-06-19T00:00:00.000Z",
  updatedAt: "2026-06-19T00:00:00.000Z",
};

const secondaryActivity = {
  id: "group-dinner",
  name: "Group Dinner",
  summary: "5 people | 4 expenses | Total $320.00",
  updatedLabel: "Updated yesterday",
};

function App() {
  const [activity, setActivity] = useState<Activity>(sampleActivity);
  const [personName, setPersonName] = useState("");
  const [personError, setPersonError] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePayerId, setExpensePayerId] = useState(
    sampleActivity.people[0]?.id ?? "",
  );
  const [expenseError, setExpenseError] = useState("");
  const totalSpentCents = useMemo(
    () =>
      activity.expenses.reduce(
        (total, expense) => total + expense.amountCents,
        0,
      ),
    [activity.expenses],
  );
  const balances = useMemo(
    () => calculateBalances(activity.people, activity.expenses),
    [activity.people, activity.expenses],
  );
  const settlements = useMemo(() => calculateSettlements(balances), [balances]);

  function handleAddPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = personName.trim();

    if (!trimmedName) {
      setPersonError("Enter a person name.");
      return;
    }

    const isDuplicate = activity.people.some(
      (person) => person.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      setPersonError(`${trimmedName} is already in this activity.`);
      return;
    }

    const person: Person = {
      id: createId("person"),
      name: trimmedName,
    };

    setActivity((currentActivity) => ({
      ...currentActivity,
      people: [...currentActivity.people, person],
      updatedAt: new Date().toISOString(),
    }));
    setExpensePayerId((currentPayerId) => currentPayerId || person.id);
    setPersonName("");
    setPersonError("");
  }

  function handleAddExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDescription = expenseDescription.trim();
    const amountCents = parseAmountToCents(expenseAmount);

    if (activity.people.length < 2) {
      setExpenseError("Add at least two people before recording expenses.");
      return;
    }

    if (!trimmedDescription) {
      setExpenseError("Enter an expense description.");
      return;
    }

    if (amountCents === null) {
      setExpenseError("Enter an amount greater than 0 with up to 2 decimals.");
      return;
    }

    if (!findPerson(activity.people, expensePayerId)) {
      setExpenseError("Choose who paid for this expense.");
      return;
    }

    setActivity((currentActivity) => ({
      ...currentActivity,
      expenses: [
        ...currentActivity.expenses,
        {
          id: createId("expense"),
          description: trimmedDescription,
          amountCents,
          paidByPersonId: expensePayerId,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
    setExpenseDescription("");
    setExpenseAmount("");
    setExpenseError("");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Shared expenses</p>
          <h1>Expense Splitter</h1>
        </div>
        <button className="primary-button" type="button">
          New activity
        </button>
      </header>

      <section className="workspace" aria-label="Expense splitter workspace">
        <aside className="activity-sidebar" aria-label="Activities">
          <div className="section-heading">
            <h2>Activities</h2>
            <span>2 saved</span>
          </div>

          <article className="activity-card activity-card-active">
            <h3>{activity.name}</h3>
            <p>
              {activity.people.length} people | {activity.expenses.length}{" "}
              expenses | Total {formatCents(totalSpentCents)}
            </p>
            <span>Updated today</span>
          </article>

          <article className="activity-card">
            <h3>{secondaryActivity.name}</h3>
            <p>{secondaryActivity.summary}</p>
            <span>{secondaryActivity.updatedLabel}</span>
          </article>
        </aside>

        <section className="activity-detail" aria-label="Selected activity">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Current activity</p>
              <h2>{activity.name}</h2>
            </div>
            <div className="total-box">
              <span>Total spent</span>
              <strong>{formatCents(totalSpentCents)}</strong>
            </div>
          </div>

          <div className="detail-grid">
            <section className="panel">
              <div className="section-heading">
                <h3>People</h3>
                <span>{activity.people.length} members</span>
              </div>
              <form className="inline-form" onSubmit={handleAddPerson}>
                <label>
                  <span>Name</span>
                  <input
                    onChange={(event) => setPersonName(event.target.value)}
                    placeholder="Alex"
                    type="text"
                    value={personName}
                  />
                </label>
                <button className="secondary-button compact-button" type="submit">
                  Add
                </button>
              </form>
              {personError ? <p className="form-error">{personError}</p> : null}
              <ul className="people-list">
                {activity.people.map((person) => (
                  <li key={person.id}>{person.name}</li>
                ))}
              </ul>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h3>Expenses</h3>
                <span>{activity.expenses.length} items</span>
              </div>
              <form className="expense-form" onSubmit={handleAddExpense}>
                <label>
                  <span>Description</span>
                  <input
                    onChange={(event) =>
                      setExpenseDescription(event.target.value)
                    }
                    placeholder="Dinner"
                    type="text"
                    value={expenseDescription}
                  />
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    inputMode="decimal"
                    onChange={(event) => setExpenseAmount(event.target.value)}
                    placeholder="45.50"
                    type="text"
                    value={expenseAmount}
                  />
                </label>
                <label>
                  <span>Paid by</span>
                  <select
                    onChange={(event) => setExpensePayerId(event.target.value)}
                    value={expensePayerId}
                  >
                    {activity.people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="secondary-button compact-button" type="submit">
                  Add expense
                </button>
              </form>
              {expenseError ? <p className="form-error">{expenseError}</p> : null}
              <ul className="expense-list">
                {activity.expenses.map((expense) => {
                  const payer = findPerson(activity.people, expense.paidByPersonId);

                  return (
                    <li key={expense.id}>
                      <span>{expense.description}</span>
                      <strong>
                        {payer?.name ?? "Unknown"} paid{" "}
                        {formatCents(expense.amountCents)}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h3>Balances</h3>
                <span>Live summary</span>
              </div>
              <ul className="balance-list">
                {balances.map((balance) => {
                  const person = findPerson(activity.people, balance.personId);

                  return (
                    <li key={balance.personId}>
                      <span>{person?.name ?? "Unknown"}</span>
                      <strong className={getBalanceClassName(balance)}>
                        {getBalanceLabel(balance)}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="panel settlement-panel">
              <div className="section-heading">
                <h3>Settlement</h3>
                <span>
                  {settlements.length}{" "}
                  {settlements.length === 1 ? "transfer" : "transfers"}
                </span>
              </div>
              {settlements.length > 0 ? (
                <ol className="settlement-list">
                  {settlements.map((settlement) => (
                    <li
                      key={`${settlement.fromPersonId}-${settlement.toPersonId}-${settlement.amountCents}`}
                    >
                      {getSettlementLabel(settlement, activity.people)}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="empty-state">Everyone is settled up.</p>
              )}
              <button className="secondary-button" type="button">
                Settle
              </button>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

function findPerson(people: Person[], personId: string): Person | undefined {
  return people.find((person) => person.id === personId);
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getBalanceClassName(balance: Balance): string {
  if (balance.amountCents > 0) {
    return "positive";
  }

  if (balance.amountCents < 0) {
    return "negative";
  }

  return "neutral";
}

function getBalanceLabel(balance: Balance): string {
  if (balance.amountCents > 0) {
    return `is owed ${formatCents(balance.amountCents)}`;
  }

  if (balance.amountCents < 0) {
    return `owes ${formatCents(Math.abs(balance.amountCents))}`;
  }

  return "is settled up";
}

function getSettlementLabel(
  settlement: Settlement,
  people: Person[],
): string {
  const fromPerson = findPerson(people, settlement.fromPersonId);
  const toPerson = findPerson(people, settlement.toPersonId);

  return `${fromPerson?.name ?? "Unknown"} pays ${toPerson?.name ?? "Unknown"} ${formatCents(settlement.amountCents)}`;
}

export default App;
