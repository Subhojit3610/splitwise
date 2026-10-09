import React, { useState, useMemo } from 'react';
import { Expense, Settlement, Person, ExpenseCategory } from '../types';
import { CategoryIcon, CATEGORY_CONFIG } from './CategoryIcon';
import { formatCurrency } from '../utils/splitwise';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Receipt,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  settlements: Settlement[];
  people: Person[];
  currency: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onDeleteSettlement: (settlementId: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  settlements,
  people,
  currency,
  onEditExpense,
  onDeleteExpense,
  onDeleteSettlement,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expenses' | 'settlements'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    people.forEach((p) => map.set(p.id, p));
    return map;
  }, [people]);

  // Combine and sort chronologically
  type TimelineItem =
    | { type: 'expense'; data: Expense; timestamp: number }
    | { type: 'settlement'; data: Settlement; timestamp: number };

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];

    if (filterType !== 'settlements') {
      expenses.forEach((exp) => {
        items.push({
          type: 'expense',
          data: exp,
          timestamp: exp.createdAt || new Date(exp.date).getTime(),
        });
      });
    }

    if (filterType !== 'expenses') {
      settlements.forEach((set) => {
        items.push({
          type: 'settlement',
          data: set,
          timestamp: set.createdAt || new Date(set.date).getTime(),
        });
      });
    }

    // Filter by category (for expenses)
    let filtered = items;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (it) => it.type === 'expense' && it.data.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((it) => {
        if (it.type === 'expense') {
          const payer = peopleMap.get(it.data.paidById)?.name.toLowerCase() || '';
          return (
            it.data.title.toLowerCase().includes(q) ||
            payer.includes(q) ||
            (it.data.notes && it.data.notes.toLowerCase().includes(q))
          );
        } else {
          const fromName = peopleMap.get(it.data.fromPersonId)?.name.toLowerCase() || '';
          const toName = peopleMap.get(it.data.toPersonId)?.name.toLowerCase() || '';
          return fromName.includes(q) || toName.includes(q);
        }
      });
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses, settlements, filterType, selectedCategory, searchQuery, peopleMap]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Activity & History</h2>
          <p className="text-xs text-slate-500">
            Chronological record of expenses and payments
          </p>
        </div>

        {/* Filter type buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
          <button
            id="tab-filter-all"
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({expenses.length + settlements.length})
          </button>
          <button
            id="tab-filter-expenses"
            type="button"
            onClick={() => setFilterType('expenses')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'expenses'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses ({expenses.length})
          </button>
          <button
            id="tab-filter-settlements"
            type="button"
            onClick={() => setFilterType('settlements')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'settlements'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settlements ({settlements.length})
          </button>
        </div>
      </div>

      {/* Search & Category Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-expense-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, payer, notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {filterType !== 'settlements' && (
          <div className="relative w-full sm:w-auto">
            <select
              id="select-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      {timeline.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-lg">
          <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">No records found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Add an expense to start splitting costs among the 7 friends.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((item) => {
            if (item.type === 'expense') {
              const exp = item.data;
              const payer = peopleMap.get(exp.paidById);
              const splitCount = Object.keys(exp.splits).length;
              const isAllSeven = splitCount === 7;

              return (
                <div
                  key={`exp-${exp.id}`}
                  id={`expense-row-${exp.id}`}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <CategoryIcon category={exp.category} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900">
                          {exp.title}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {CATEGORY_CONFIG[exp.category]?.label || exp.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-700">
                            {payer?.name || 'Unknown'}
                          </span>{' '}
                          paid
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {isAllSeven
                            ? 'All 7 friends'
                            : `${splitCount} members (${Object.keys(exp.splits)
                                .map((id) => peopleMap.get(id)?.name)
                                .filter(Boolean)
                                .join(', ')})`}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {exp.date}
                        </span>
                      </div>

                      {exp.notes && (
                        <p className="text-xs text-slate-400 italic mt-1">
                          "{exp.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount & action buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-bold text-slate-900 block">
                        {formatCurrency(exp.amount, currency)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatCurrency(exp.amount / splitCount, currency)} / person
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`btn-edit-expense-${exp.id}`}
                        type="button"
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-expense-${exp.id}`}
                        type="button"
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Settlement
              const set = item.data;
              const fromPerson = peopleMap.get(set.fromPersonId);
              const toPerson = peopleMap.get(set.toPersonId);

              return (
                <div
                  key={`settle-${set.id}`}
                  id={`settle-row-${set.id}`}
                  className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <span className="text-slate-900">{fromPerson?.name || 'Someone'}</span>
                        <span className="text-slate-400 font-normal">paid</span>
                        <span className="text-slate-900">{toPerson?.name || 'Someone'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="text-emerald-700 font-medium">Payment Settlement</span>
                        <span className="text-slate-300">•</span>
                        <span>{set.date}</span>
                        {set.notes && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="italic text-slate-600">"{set.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-bold text-emerald-700">
                        {formatCurrency(set.amount, currency)}
                      </span>
                      <span className="text-[11px] text-emerald-600 block font-medium">
                        Settled
                      </span>
                    </div>

                    <button
                      id={`btn-delete-settlement-${set.id}`}
                      type="button"
                      onClick={() => onDeleteSettlement(set.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Undo settlement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};
