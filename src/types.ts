export type Person = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  description: string;
  amountCents: number;
  paidByPersonId: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  name: string;
  people: Person[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
};

export type Balance = {
  personId: string;
  amountCents: number;
};

export type Settlement = {
  fromPersonId: string;
  toPersonId: string;
  amountCents: number;
};
