import { type FormEvent, useEffect, useMemo, useState } from "react";

import type { Activity, Balance, Person, Settlement } from "./types";
import { formatCents, parseAmountToCents } from "./utils/money";
import { calculateBalances, calculateSettlements } from "./utils/settlement";
import {
  loadActivities,
  loadSelectedActivityId,
  saveActivities,
  saveSelectedActivityId,
} from "./utils/storage";
import "./App.css";

function App() {
  const [activities, setActivities] = useState<Activity[]>(() =>
    loadActivities([]),
  );
  const [selectedActivityId, setSelectedActivityId] = useState(() =>
    loadSelectedActivityId(""),
  );
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [activityError, setActivityError] = useState("");
  const [personName, setPersonName] = useState("");
  const [personError, setPersonError] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePayerId, setExpensePayerId] = useState("");
  const [expenseError, setExpenseError] = useState("");
  const [isEditingPeople, setIsEditingPeople] = useState(false);
  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const activity =
    activities.find((currentActivity) => currentActivity.id === selectedActivityId) ??
    activities[0];
  const hasActivity = activity !== undefined;
  const totalSpentCents = useMemo(
    () => {
      if (!activity) {
        return 0;
      }

      return activity.expenses.reduce(
        (total, expense) => total + expense.amountCents,
        0,
      );
    },
    [activity],
  );
  const balances = useMemo(
    () =>
      activity ? calculateBalances(activity.people, activity.expenses) : [],
    [activity],
  );
  const settlements = useMemo(() => calculateSettlements(balances), [balances]);
  const validExpensePayerId = activity && findPerson(activity.people, expensePayerId)
    ? expensePayerId
    : activity?.people[0]?.id ?? "";

  useEffect(() => {
    saveActivities(activities);
    saveSelectedActivityId(activity?.id ?? "");
  }, [activities, activity?.id]);

  function handleSelectActivity(activityId: string) {
    const nextActivity = activities.find(
      (currentActivity) => currentActivity.id === activityId,
    );

    if (!nextActivity) {
      return;
    }

    setSelectedActivityId(activityId);
    setExpensePayerId(nextActivity.people[0]?.id ?? "");
    setPersonName("");
    setPersonError("");
    setExpenseDescription("");
    setExpenseAmount("");
    setExpenseError("");
    setIsEditingPeople(false);
    setIsEditingExpenses(false);
  }

  function handleCreateActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = activityName.trim();

    if (!trimmedName) {
      setActivityError("Enter an activity name.");
      return;
    }

    const now = new Date().toISOString();
    const nextActivity: Activity = {
      id: createId("activity"),
      name: trimmedName,
      people: [],
      expenses: [],
      createdAt: now,
      updatedAt: now,
    };

    setActivities((currentActivities) => [nextActivity, ...currentActivities]);
    setSelectedActivityId(nextActivity.id);
    setActivityName("");
    setActivityError("");
    setIsCreatingActivity(false);
    setExpensePayerId("");
    setPersonName("");
    setExpenseDescription("");
    setExpenseAmount("");
    setPersonError("");
    setExpenseError("");
    setIsEditingPeople(false);
    setIsEditingExpenses(false);
  }

  function updateActivity(
    updateCurrentActivity: (currentActivity: Activity) => Activity,
  ) {
    if (!activity) {
      return;
    }

    setActivities((currentActivities) =>
      currentActivities.map((currentActivity) =>
        currentActivity.id === activity.id
          ? updateCurrentActivity(currentActivity)
          : currentActivity,
      ),
    );
  }

  function handleAddPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activity) {
      return;
    }

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

    updateActivity((currentActivity) => ({
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

    if (!activity) {
      return;
    }

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

    if (!validExpensePayerId) {
      setExpenseError("Choose who paid for this expense.");
      return;
    }

    updateActivity((currentActivity) => ({
      ...currentActivity,
      expenses: [
        ...currentActivity.expenses,
        {
          id: createId("expense"),
          description: trimmedDescription,
          amountCents,
          paidByPersonId: validExpensePayerId,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
    setExpenseDescription("");
    setExpenseAmount("");
    setExpenseError("");
  }

  function handleRemovePerson(personId: string) {
    if (!activity) {
      return;
    }

    const person = findPerson(activity.people, personId);
    const hasPaidExpense = activity.expenses.some(
      (expense) => expense.paidByPersonId === personId,
    );

    if (hasPaidExpense) {
      setPersonError(
        `${person?.name ?? "This person"} cannot be removed because they are linked to existing expenses.`,
      );
      return;
    }

    const remainingPeople = activity.people.filter(
      (currentPerson) => currentPerson.id !== personId,
    );

    updateActivity((currentActivity) => ({
      ...currentActivity,
      people: currentActivity.people.filter(
        (currentPerson) => currentPerson.id !== personId,
      ),
      updatedAt: new Date().toISOString(),
    }));
    setExpensePayerId((currentPayerId) =>
      currentPayerId === personId
        ? remainingPeople[0]?.id ?? ""
        : currentPayerId,
    );
    setPersonError("");
  }

  function handleDeleteExpense(expenseId: string) {
    if (!activity) {
      return;
    }

    updateActivity((currentActivity) => ({
      ...currentActivity,
      expenses: currentActivity.expenses.filter(
        (expense) => expense.id !== expenseId,
      ),
      updatedAt: new Date().toISOString(),
    }));
    setExpenseError("");
    setPersonError("");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Shared expenses</p>
          <h1>Expense Splitter</h1>
        </div>
        <button
          className="primary-button"
          onClick={() => setIsCreatingActivity(true)}
          type="button"
        >
          New activity
        </button>
      </header>

      <section className="workspace" aria-label="Expense splitter workspace">
        <aside className="activity-sidebar" aria-label="Activities">
          <div className="section-heading">
            <h2>Activities</h2>
            <span>{activities.length} saved</span>
          </div>

          {isCreatingActivity ? (
            <form className="activity-form" onSubmit={handleCreateActivity}>
              <label>
                <span>Activity name</span>
                <input
                  onChange={(event) => setActivityName(event.target.value)}
                  placeholder="Weekend Trip"
                  type="text"
                  value={activityName}
                />
              </label>
              <div className="activity-form-actions">
                <button className="secondary-button compact-button" type="submit">
                  Create
                </button>
                <button
                  className="edit-button"
                  onClick={() => {
                    setIsCreatingActivity(false);
                    setActivityName("");
                    setActivityError("");
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
              {activityError ? <p className="form-error">{activityError}</p> : null}
            </form>
          ) : null}

          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="sidebar-empty-state">
                No activities yet. Create one to start splitting expenses.
              </div>
            ) : null}

            {activities.map((currentActivity) => {
              const activityTotalCents = getTotalSpentCents(currentActivity);
              const isSelected = currentActivity.id === activity?.id;

              return (
                <button
                  aria-current={isSelected ? "page" : undefined}
                  className={
                    isSelected
                      ? "activity-card activity-card-active"
                      : "activity-card"
                  }
                  key={currentActivity.id}
                  onClick={() => handleSelectActivity(currentActivity.id)}
                  type="button"
                >
                  <h3>{currentActivity.name}</h3>
                  <p>
                    {currentActivity.people.length} people |{" "}
                    {currentActivity.expenses.length} expenses | Total{" "}
                    {formatCents(activityTotalCents)}
                  </p>
                  <span>Updated {formatDate(currentActivity.updatedAt)}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {hasActivity ? (
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
                <div>
                  <h3>People</h3>
                  <span>{activity.people.length} members</span>
                </div>
                <button
                  aria-label={isEditingPeople ? "Finish editing people" : "Edit people"}
                  className="edit-button"
                  onClick={() =>
                    setIsEditingPeople((currentValue) => !currentValue)
                  }
                  type="button"
                >
                  {isEditingPeople ? "Done" : "Edit"}
                </button>
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
                  <li key={person.id}>
                    <span>{person.name}</span>
                    {isEditingPeople ? (
                      <button
                        aria-label={`Remove ${person.name}`}
                        className="remove-icon-button"
                        onClick={() => handleRemovePerson(person.id)}
                        type="button"
                      >
                        -
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel">
              <div className="section-heading">
                <div>
                  <h3>Expenses</h3>
                  <span>{activity.expenses.length} items</span>
                </div>
                <button
                  aria-label={
                    isEditingExpenses ? "Finish editing expenses" : "Edit expenses"
                  }
                  className="edit-button"
                  onClick={() =>
                    setIsEditingExpenses((currentValue) => !currentValue)
                  }
                  type="button"
                >
                  {isEditingExpenses ? "Done" : "Edit"}
                </button>
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
                    value={validExpensePayerId}
                  >
                    {activity.people.length === 0 ? (
                      <option value="">No people yet</option>
                    ) : (
                      activity.people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button className="secondary-button compact-button" type="submit">
                  Add expense
                </button>
              </form>
              {expenseError ? <p className="form-error">{expenseError}</p> : null}
              {activity.expenses.length > 0 ? (
                <ul className="expense-list">
                  {activity.expenses.map((expense) => {
                    const payer = findPerson(
                      activity.people,
                      expense.paidByPersonId,
                    );

                    return (
                      <li key={expense.id}>
                        <span>{expense.description}</span>
                        <div className="row-actions">
                          <strong>
                            {payer?.name ?? "Unknown"} paid{" "}
                            {formatCents(expense.amountCents)}
                          </strong>
                          {isEditingExpenses ? (
                            <button
                              aria-label={`Delete ${expense.description}`}
                              className="remove-icon-button"
                              onClick={() => handleDeleteExpense(expense.id)}
                              type="button"
                            >
                              -
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="empty-state">No expenses recorded yet.</p>
              )}
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
        ) : (
          <section className="activity-detail empty-detail" aria-label="No activity selected">
            <p className="eyebrow">Current activity</p>
            <h2>No activity yet</h2>
            <p>
              Create your first activity to add people, record expenses, and see
              settlement suggestions.
            </p>
            <button
              className="primary-button"
              onClick={() => setIsCreatingActivity(true)}
              type="button"
            >
              New activity
            </button>
          </section>
        )}
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

function getTotalSpentCents(activity: Activity): number {
  return activity.expenses.reduce(
    (total, expense) => total + expense.amountCents,
    0,
  );
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
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
