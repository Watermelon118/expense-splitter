import type { Activity, Balance, Person, Settlement } from "./types";
import { formatCents } from "./utils/money";
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
  const activity = sampleActivity;
  const totalSpentCents = activity.expenses.reduce(
    (total, expense) => total + expense.amountCents,
    0,
  );
  const balances = calculateBalances(activity.people, activity.expenses);
  const settlements = calculateSettlements(balances);

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
