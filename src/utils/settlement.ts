import type { Balance, Expense, Person, Settlement } from "../types";

export function calculateBalances(
  people: Person[],
  expenses: Expense[],
): Balance[] {
  const balances = new Map(
    people.map((person) => [person.id, 0]),
  );

  for (const expense of expenses) {
    const payerBalance = balances.get(expense.paidByPersonId);

    if (payerBalance === undefined || people.length === 0) {
      continue;
    }

    balances.set(expense.paidByPersonId, payerBalance + expense.amountCents);

    const baseShareCents = Math.floor(expense.amountCents / people.length);
    const remainderCents = expense.amountCents % people.length;

    people.forEach((person, index) => {
      const currentBalance = balances.get(person.id) ?? 0;
      const shareCents = baseShareCents + (index < remainderCents ? 1 : 0);

      balances.set(person.id, currentBalance - shareCents);
    });
  }

  return people.map((person) => ({
    personId: person.id,
    amountCents: balances.get(person.id) ?? 0,
  }));
}

export function calculateSettlements(balances: Balance[]): Settlement[] {
  const debtors = balances
    .filter((balance) => balance.amountCents < 0)
    .map((balance) => ({
      personId: balance.personId,
      amountCents: Math.abs(balance.amountCents),
    }));

  const creditors = balances
    .filter((balance) => balance.amountCents > 0)
    .map((balance) => ({
      personId: balance.personId,
      amountCents: balance.amountCents,
    }));

  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountCents = Math.min(debtor.amountCents, creditor.amountCents);

    settlements.push({
      fromPersonId: debtor.personId,
      toPersonId: creditor.personId,
      amountCents,
    });

    debtor.amountCents -= amountCents;
    creditor.amountCents -= amountCents;

    if (debtor.amountCents === 0) {
      debtorIndex += 1;
    }

    if (creditor.amountCents === 0) {
      creditorIndex += 1;
    }
  }

  return settlements;
}
