import React from 'react';
import { Person, Expense, Settlement, PersonBalanceSummary } from '../types';
import { formatCurrency } from '../utils/splitwise';
import { X, CheckCircle2, ArrowDownRight, ArrowUpRight, Check, Receipt } from 'lucide-react';

interface MemberDetailModalProps {
  person: Person | null;
  onClose: () => void;
  people: Person[];
  expenses: Expense[];
  settlements: Settlement[];
  balances: Record<string, PersonBalanceSummary>;
  currency: string;
  onSettleWith: (fromId: string, toId: string, amount: number) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  person,
  onClose,
  people,
  expenses,
  settlements,
  balances,
  currency,
  onSettleWith,
}) => {
  if (!person) return null;

  const summary = balances[person.id] || {
    person,
    totalPaid: 0,
    totalShare: 0,
    netBalance: 0,
  };

  const net = summary.netBalance;
  const isGetsBack = net > 0.05;
  const isOwes = net < -0.05;

  // Calculate pairwise balances between `person` and each other friend
  const otherPeople = people.filter((p) => p.id !== person.id);
  const pairwiseDebts: Array<{
    other: Person;
    netBetween: number; // positive: other owes person, negative: person owes other
  }> = [];

  otherPeople.forEach((other) => {
    let balance = 0; // from perspective of person

    // In each expense:
    expenses.forEach((exp) => {
      // If person paid and other had a split share, other owes person that share
      if (exp.paidById === person.id && exp.splits[other.id]) {
        balance += exp.splits[other.id];
      }
      // If other paid and person had a split share, person owes other that share
      if (exp.paidById === other.id && exp.splits[person.id]) {
        balance -= exp.splits[person.id];
      }
    });

    // In each settlement:
    settlements.forEach((set) => {
      if (set.fromPersonId === person.id && set.toPersonId === other.id) {
        // Person paid other back
        balance += set.amount;
      }
      if (set.fromPersonId === other.id && set.toPersonId === person.id) {
        // Other paid person back
        balance -= set.amount;
      }
    });

    pairwiseDebts.push({
      other,
      netBetween: Math.round(balance * 100) / 100,
    });
  });

  // Recent expenses involving this person
  const memberExpenses = expenses.filter(
    (exp) => exp.paidById === person.id || exp.splits[person.id] !== undefined
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${person.avatarColor} ${person.avatarTextColor} flex items-center justify-center text-base font-bold shadow-xs`}
            >
              {person.initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{person.name}</h3>
              <p className="text-xs text-slate-500">Member of 7 Friends Group</p>
            </div>
          </div>
          <button
            id="btn-close-member-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Total Paid</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {formatCurrency(summary.totalPaid, currency)}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Total Share</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {formatCurrency(summary.totalShare, currency)}
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                isGetsBack
                  ? 'bg-emerald-50 border-emerald-200'
                  : isOwes
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[11px] font-medium text-slate-500 block">Net Balance</span>
              <span
                className={`text-sm font-bold mt-0.5 block ${
                  isGetsBack
                    ? 'text-emerald-700'
                    : isOwes
                    ? 'text-rose-700'
                    : 'text-slate-700'
                }`}
              >
                {isGetsBack ? '+' : ''}
                {formatCurrency(net, currency)}
              </span>
            </div>
          </div>

          {/* Pairwise Breakdown with other 6 friends */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
              Direct Balance with Friends
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {pairwiseDebts.map(({ other, netBetween }) => {
                const otherOwesPerson = netBetween > 0.05;
                const personOwesOther = netBetween < -0.05;
                const settled = !otherOwesPerson && !personOwesOther;

                return (
                  <div
                    key={other.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-full ${other.avatarColor} text-white flex items-center justify-center text-xs font-bold`}
                      >
                        {other.initials}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-slate-800">
                          {other.name}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {otherOwesPerson && `${other.name} owes ${person.name}`}
                          {personOwesOther && `${person.name} owes ${other.name}`}
                          {settled && 'Settled up'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          otherOwesPerson
                            ? 'text-emerald-600'
                            : personOwesOther
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {otherOwesPerson ? `+${formatCurrency(netBetween, currency)}` : ''}
                        {personOwesOther ? `-${formatCurrency(Math.abs(netBetween), currency)}` : ''}
                        {settled ? formatCurrency(0, currency) : ''}
                      </span>

                      {!settled && (
                        <button
                          type="button"
                          onClick={() => {
                            if (personOwesOther) {
                              onSettleWith(person.id, other.id, Math.abs(netBetween));
                            } else {
                              onSettleWith(other.id, person.id, netBetween);
                            }
                            onClose();
                          }}
                          className="px-2 py-1 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Expenses Involving {person.name} ({memberExpenses.length})
            </h4>
            {memberExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No expenses recorded for this member yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {memberExpenses.map((exp) => {
                  const wasPayer = exp.paidById === person.id;
                  const share = exp.splits[person.id] || 0;

                  return (
                    <div
                      key={exp.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{exp.title}</span>
                        <p className="text-[11px] text-slate-500">
                          {wasPayer ? `Paid full ${formatCurrency(exp.amount, currency)}` : `Share: ${formatCurrency(share, currency)}`}
                          {' • '}
                          {exp.date}
                        </p>
                      </div>
                      <span className={`font-semibold ${wasPayer ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {wasPayer ? `+${formatCurrency(exp.amount - share, currency)}` : `-${formatCurrency(share, currency)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
