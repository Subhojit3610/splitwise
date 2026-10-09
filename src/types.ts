export interface Person {
  id: string;
  name: string;
  avatarColor: string;
  avatarTextColor: string;
  initials: string;
}

export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'stay'
  | 'groceries'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'other';

export type SplitMode = 'equal' | 'exact' | 'unequal';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidById: string;
  category: ExpenseCategory;
  date: string; // ISO date string YYYY-MM-DD
  splitMode: SplitMode;
  // Maps personId -> amount they owe for this expense
  splits: Record<string, number>;
  notes?: string;
  createdAt: number;
}

export interface Settlement {
  id: string;
  fromPersonId: string; // who paid the settlement
  toPersonId: string;   // who received the settlement
  amount: number;
  currency: string;
  date: string;
  notes?: string;
  createdAt: number;
}

export interface DebtTransfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface PersonBalanceSummary {
  person: Person;
  totalPaid: number;      // Paid for expenses + settlements made
  totalShare: number;     // Total share of expenses consumed
  netBalance: number;     // Positive: gets back, Negative: owes
}
