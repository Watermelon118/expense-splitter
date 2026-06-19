import { describe, expect, it } from "vitest";

import type { Expense, Person } from "../types";
import { calculateBalances, calculateSettlements } from "./settlement";

function person(id: string): Person {
  return { id, name: id };
}

function expense(
  id: string,
  amountCents: number,
  paidByPersonId: string,
): Expense {
  return {
    id,
    amountCents,
    paidByPersonId,
    description: id,
    createdAt: "2026-06-19T00:00:00.000Z",
  };
}

describe("calculateBalances", () => {
  it("splits one payer expense equally", () => {
    const people = [person("A"), person("B"), person("C")];
    const expenses = [expense("Dinner", 9000, "A")];

    expect(calculateBalances(people, expenses)).toEqual([
      { personId: "A", amountCents: 6000 },
      { personId: "B", amountCents: -3000 },
      { personId: "C", amountCents: -3000 },
    ]);
  });

  it("handles multiple payers", () => {
    const people = [person("A"), person("B"), person("C"), person("D")];
    const expenses = [
      expense("Hotel", 30000, "A"),
      expense("Fuel", 20000, "B"),
      expense("Car Rental", 50000, "C"),
    ];

    expect(calculateBalances(people, expenses)).toEqual([
      { personId: "A", amountCents: 5000 },
      { personId: "B", amountCents: -5000 },
      { personId: "C", amountCents: 25000 },
      { personId: "D", amountCents: -25000 },
    ]);
  });

  it("returns zero balances when there are no expenses", () => {
    const people = [person("A"), person("B")];

    expect(calculateBalances(people, [])).toEqual([
      { personId: "A", amountCents: 0 },
      { personId: "B", amountCents: 0 },
    ]);
  });

  it("keeps total balances at zero when cents do not split evenly", () => {
    const people = [person("A"), person("B"), person("C")];
    const balances = calculateBalances(people, [expense("Snack", 100, "A")]);
    const totalBalanceCents = balances.reduce(
      (total, balance) => total + balance.amountCents,
      0,
    );

    expect(balances).toEqual([
      { personId: "A", amountCents: 66 },
      { personId: "B", amountCents: -33 },
      { personId: "C", amountCents: -33 },
    ]);
    expect(totalBalanceCents).toBe(0);
  });
});

describe("calculateSettlements", () => {
  it("creates settlements for one payer expense", () => {
    const balances = [
      { personId: "A", amountCents: 6000 },
      { personId: "B", amountCents: -3000 },
      { personId: "C", amountCents: -3000 },
    ];

    expect(calculateSettlements(balances)).toEqual([
      { fromPersonId: "B", toPersonId: "A", amountCents: 3000 },
      { fromPersonId: "C", toPersonId: "A", amountCents: 3000 },
    ]);
  });

  it("creates settlements for multiple debtors and creditors", () => {
    const balances = [
      { personId: "A", amountCents: 5000 },
      { personId: "B", amountCents: -5000 },
      { personId: "C", amountCents: 25000 },
      { personId: "D", amountCents: -25000 },
    ];

    const settlements = calculateSettlements(balances);

    expect(settlements).toEqual([
      { fromPersonId: "B", toPersonId: "A", amountCents: 5000 },
      { fromPersonId: "D", toPersonId: "C", amountCents: 25000 },
    ]);
    expect(
      settlements.reduce((total, settlement) => total + settlement.amountCents, 0),
    ).toBe(30000);
  });

  it("returns no settlements when everyone is settled", () => {
    const people = [person("A"), person("B")];
    const expenses = [
      expense("A payment", 5000, "A"),
      expense("B payment", 5000, "B"),
    ];
    const balances = calculateBalances(people, expenses);

    expect(balances).toEqual([
      { personId: "A", amountCents: 0 },
      { personId: "B", amountCents: 0 },
    ]);
    expect(calculateSettlements(balances)).toEqual([]);
  });
});
