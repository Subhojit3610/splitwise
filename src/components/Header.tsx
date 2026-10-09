import React from 'react';
import { Person } from '../types';
import { Plus, CheckCircle2, RotateCcw, Share2, Users } from 'lucide-react';

interface HeaderProps {
  people: Person[];
  currency: string;
  onCurrencyChange: (c: string) => void;
  onAddExpense: () => void;
  onSettleUp: () => void;
  onShare: () => void;
  onReset: () => void;
  onSelectPerson: (person: Person) => void;
}

export const Header: React.FC<HeaderProps> = ({
  people,
  currency,
  onCurrencyChange,
  onAddExpense,
  onSettleUp,
  onShare,
  onReset,
  onSelectPerson,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Brand & Group Label */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-bold text-xl tracking-tight">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Splitwise</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  7 Members
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Group: Lokesh, DNP, Subhajit, Anike, Amit, Avik, Sameek
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Currency selector */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs font-medium">
              {(['₹', '$', '€', '£'] as const).map((curr) => (
                <button
                  key={curr}
                  id={`btn-curr-${curr}`}
                  type="button"
                  onClick={() => onCurrencyChange(curr)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    currency === curr
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Share WhatsApp summary */}
            <button
              id="btn-share-summary"
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              title="Share or copy WhatsApp breakdown"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share Summary</span>
            </button>

            {/* Settle Up button */}
            <button
              id="btn-settle-up-main"
              type="button"
              onClick={onSettleUp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settle Up</span>
            </button>

            {/* Reset / Sample data */}
            <button
              id="btn-reset-data"
              type="button"
              onClick={onReset}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Reset data or reload sample"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Add Expense Primary Button */}
            <button
              id="btn-add-expense-main"
              type="button"
              onClick={onAddExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 7 Members Pill Bar */}
        <div className="py-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5" /> Members:
          </span>
          <div className="flex items-center gap-1.5">
            {people.map((p) => (
              <button
                key={p.id}
                id={`btn-member-pill-${p.id}`}
                type="button"
                onClick={() => onSelectPerson(p)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 shrink-0"
              >
                <span className={`w-4 h-4 rounded-full ${p.avatarColor} ${p.avatarTextColor} flex items-center justify-center text-[9px] font-bold`}>
                  {p.initials}
                </span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
