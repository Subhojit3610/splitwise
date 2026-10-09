import { Person, Expense, Settlement, DebtTransfer, PersonBalanceSummary } from '../types';

/**
 * Calculates net balance and summaries for each person in the group.
 * Positive netBalance = Person is owed money (gets back)
 * Negative netBalance = Person owes money
 */
export function calculateBalances(
  people: Person[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, PersonBalanceSummary> {
  const result: Record<string, PersonBalanceSummary> = {};

  people.forEach((p) => {
    result[p.id] = {
      person: p,
      totalPaid: 0,
      totalShare: 0,
      netBalance: 0,
    };
  });

  // Calculate expense impacts
  expenses.forEach((exp) => {
    // Payer credited for paying full amount
    if (result[exp.paidById]) {
      result[exp.paidById].totalPaid += exp.amount;
      result[exp.paidById].netBalance += exp.amount;
    }

    // Each participant debited for their share
    Object.entries(exp.splits).forEach(([personId, share]) => {
      if (result[personId]) {
        result[personId].totalShare += share;
        result[personId].netBalance -= share;
      }
    });
  });

  // Calculate settlement impacts
  settlements.forEach((settle) => {
    // Payer gave money, so their debt decreases (netBalance increases)
    if (result[settle.fromPersonId]) {
      result[settle.fromPersonId].totalPaid += settle.amount;
      result[settle.fromPersonId].netBalance += settle.amount;
    }

    // Receiver received money, so their credit decreases (netBalance decreases)
    if (result[settle.toPersonId]) {
      result[settle.toPersonId].netBalance -= settle.amount;
    }
  });

  return result;
}

/**
 * Splitwise greedy debt simplification algorithm to minimize total number of transactions.
 */
export function simplifyDebts(
  people: Person[],
  balances: Record<string, PersonBalanceSummary>
): DebtTransfer[] {
  const nameMap = new Map<string, string>();
  people.forEach((p) => nameMap.set(p.id, p.name));

  interface Account {
    id: string;
    balance: number;
  }

  const debtors: Account[] = [];
  const creditors: Account[] = [];

  Object.values(balances).forEach((b) => {
    // Round to 2 decimal places to avoid floating point precision artifacts
    const net = Math.round(b.netBalance * 100) / 100;
    if (net < -0.05) {
      debtors.push({ id: b.person.id, balance: net });
    } else if (net > 0.05) {
      creditors.push({ id: b.person.id, balance: net });
    }
  });

  // Sort descending by magnitude
  debtors.sort((a, b) => a.balance - b.balance); // most negative first
  creditors.sort((a, b) => b.balance - a.balance); // most positive first

  const transfers: DebtTransfer[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const debtAmount = -debtor.balance;
    const creditAmount = creditor.balance;

    const settledAmount = Math.min(debtAmount, creditAmount);

    if (settledAmount > 0.05) {
      transfers.push({
        fromId: debtor.id,
        fromName: nameMap.get(debtor.id) || debtor.id,
        toId: creditor.id,
        toName: nameMap.get(creditor.id) || creditor.id,
        amount: Math.round(settledAmount * 100) / 100,
      });
    }

    debtor.balance += settledAmount;
    creditor.balance -= settledAmount;

    if (Math.abs(debtor.balance) < 0.05) {
      dIdx++;
    }
    if (Math.abs(creditor.balance) < 0.05) {
      cIdx++;
    }
  }

  return transfers;
}

/**
 * Format currency neatly.
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  const isNegative = amount < -0.01;
  const abs = Math.abs(amount);
  const formatted = abs % 1 === 0 ? abs.toLocaleString('en-IN') : abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

/**
 * Generate formatted text for sharing on WhatsApp or SMS with the group
 */
export function generateWhatsAppSummary(
  people: Person[],
  expenses: Expense[],
  settlements: Settlement[],
  currency: string = '₹'
): string {
  const balances = calculateBalances(people, expenses, settlements);
  const simplified = simplifyDebts(people, balances);
  const totalGroupSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  let text = `*📊 Splitwise Summary - 7 Friends*\n`;
  text += `_Lokesh, DNP, Subhajit, Anike, Amit, Avik, Sameek_\n\n`;
  text += `💰 *Total Group Spend:* ${formatCurrency(totalGroupSpend, currency)} across ${expenses.length} expenses\n\n`;

  text += `*⚖️ Net Balances:*\n`;
  people.forEach((p) => {
    const b = balances[p.id];
    const net = Math.round((b?.netBalance || 0) * 100) / 100;
    if (net > 0.05) {
      text += `• ${p.name}: gets back +${formatCurrency(net, currency)}\n`;
    } else if (net < -0.05) {
      text += `• ${p.name}: owes ${formatCurrency(Math.abs(net), currency)}\n`;
    } else {
      text += `• ${p.name}: settled up (0)\n`;
    }
  });

  text += `\n*🤝 Simplified Settlement Plan (${simplified.length} transfers):*\n`;
  if (simplified.length === 0) {
    text += `🎉 All debts are settled! Nobody owes anything.\n`;
  } else {
    simplified.forEach((t, i) => {
      text += `${i + 1}. *${t.fromName}* ➡️ *${t.toName}*: ${formatCurrency(t.amount, currency)}\n`;
    });
  }

  text += `\n_Generated with Splitwise Group App_`;
  return text;
}
