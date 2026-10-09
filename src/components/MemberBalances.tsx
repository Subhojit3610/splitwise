import React from 'react';
import { Person, PersonBalanceSummary } from '../types';
import { formatCurrency } from '../utils/splitwise';
import { ChevronRight, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';

interface MemberBalancesProps {
  people: Person[];
  balances: Record<string, PersonBalanceSummary>;
  currency: string;
  onSelectPerson: (person: Person) => void;
  onSettlePerson?: (person: Person) => void;
}

export const MemberBalances: React.FC<MemberBalancesProps> = ({
  people,
  balances,
  currency,
  onSelectPerson,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Member Balances</h2>
          <p className="text-xs text-slate-500">
            Net balance for each of the 7 members (click for personal ledger)
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {people.map((person) => {
          const summary = balances[person.id];
          const net = summary?.netBalance || 0;
          const isGetsBack = net > 0.05;
          const isOwes = net < -0.05;
          const isSettled = !isGetsBack && !isOwes;

          return (
            <div
              key={person.id}
              id={`member-row-${person.id}`}
              onClick={() => onSelectPerson(person)}
              className="py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
            >
              {/* Left: Avatar & Name & details */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full ${person.avatarColor} ${person.avatarTextColor} flex items-center justify-center text-sm font-bold shrink-0 shadow-xs`}
                >
                  {person.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {person.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Paid: <strong className="text-slate-700 font-medium">{formatCurrency(summary?.totalPaid || 0, currency)}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Share: <strong className="text-slate-700 font-medium">{formatCurrency(summary?.totalShare || 0, currency)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right: Net Status */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  {isGetsBack && (
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        gets back
                      </span>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">
                        +{formatCurrency(net, currency)}
                      </p>
                    </div>
                  )}
                  {isOwes && (
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        owes
                      </span>
                      <p className="text-sm font-bold text-rose-600 mt-0.5">
                        {formatCurrency(Math.abs(net), currency)}
                      </p>
                    </div>
                  )}
                  {isSettled && (
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 text-slate-500" />
                        settled up
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {formatCurrency(0, currency)}
                      </p>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
