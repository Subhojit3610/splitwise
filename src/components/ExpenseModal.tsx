import React, { useState, useEffect } from 'react';
import { Expense, Person, ExpenseCategory, SplitMode } from '../types';
import { CATEGORY_CONFIG } from './CategoryIcon';
import { X, Check, Users, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/splitwise';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>, editingId?: string) => void;
  people: Person[];
  currency: string;
  initialExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  people,
  currency,
  initialExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidById, setPaidById] = useState(people[0]?.id || 'lokesh');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  // For equal split among subset: which people are included
  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    people.forEach((p) => {
      init[p.id] = true;
    });
    return init;
  });
  // For exact split: exact amounts
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    people.forEach((p) => {
      init[p.id] = '';
    });
    return init;
  });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmountStr(initialExpense.amount.toString());
      setPaidById(initialExpense.paidById);
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setSplitMode(initialExpense.splitMode);
      setNotes(initialExpense.notes || '');

      const newSelected: Record<string, boolean> = {};
      const newExact: Record<string, string> = {};
      people.forEach((p) => {
        if (initialExpense.splits[p.id] !== undefined && initialExpense.splits[p.id] > 0) {
          newSelected[p.id] = true;
          newExact[p.id] = initialExpense.splits[p.id].toString();
        } else {
          newSelected[p.id] = false;
          newExact[p.id] = '0';
        }
      });
      setSelectedMembers(newSelected);
      setExactAmounts(newExact);
    } else {
      setTitle('');
      setAmountStr('');
      setPaidById(people[0]?.id || 'lokesh');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setSplitMode('equal');
      setNotes('');
      const initSelected: Record<string, boolean> = {};
      const initExact: Record<string, string> = {};
      people.forEach((p) => {
        initSelected[p.id] = true;
        initExact[p.id] = '';
      });
      setSelectedMembers(initSelected);
      setExactAmounts(initExact);
    }
    setError(null);
  }, [initialExpense, isOpen, people]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;
  const activeCount = Object.values(selectedMembers).filter(Boolean).length;
  const sharePerPerson = activeCount > 0 ? numericAmount / activeCount : 0;

  // Exact amount sum calculation
  const exactSum: number = (Object.values(exactAmounts) as string[]).reduce(
    (sum: number, val: string) => sum + (parseFloat(val) || 0),
    0
  );
  const exactDifference = Math.round((numericAmount - exactSum) * 100) / 100;

  const handleToggleMember = (id: string) => {
    setSelectedMembers((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      // Prevent unchecking all
      const count = Object.values(updated).filter(Boolean).length;
      if (count === 0) return prev;
      return updated;
    });
  };

  const handleSelectAll = (all: boolean) => {
    const updated: Record<string, boolean> = {};
    people.forEach((p) => {
      updated[p.id] = all;
    });
    setSelectedMembers(updated);
  };

  const handleExactChange = (id: string, val: string) => {
    setExactAmounts((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the expense.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    const splits: Record<string, number> = {};

    if (splitMode === 'equal') {
      if (activeCount === 0) {
        setError('At least one person must be included in the split.');
        return;
      }
      const share = Math.round((numericAmount / activeCount) * 100) / 100;
      let runningSum = 0;
      const membersToSplit = people.filter((p) => selectedMembers[p.id]);

      membersToSplit.forEach((p, idx) => {
        if (idx === membersToSplit.length - 1) {
          // Adjust last person by remainder
          splits[p.id] = Math.round((numericAmount - runningSum) * 100) / 100;
        } else {
          splits[p.id] = share;
          runningSum += share;
        }
      });
    } else {
      // Exact split
      if (Math.abs(exactDifference) > 0.05) {
        setError(
          `The split amounts do not sum to ${formatCurrency(numericAmount, currency)}. Difference: ${formatCurrency(exactDifference, currency)}.`
        );
        return;
      }
      people.forEach((p) => {
        const val = parseFloat(exactAmounts[p.id]) || 0;
        if (val > 0) {
          splits[p.id] = val;
        }
      });
    }

    onSave(
      {
        title: title.trim(),
        amount: numericAmount,
        currency,
        paidById,
        category,
        date,
        splitMode,
        splits,
        notes: notes.trim() || undefined,
      },
      initialExpense?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialExpense ? 'Edit Expense' : 'Add an Expense'}
            </h3>
            <p className="text-xs text-slate-500">
              Split costs evenly or custom among the 7 friends
            </p>
          </div>
          <button
            id="btn-close-expense-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="expense-title-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Title *
              </label>
              <input
                id="expense-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner, Villa, Petrol, Snacks"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="expense-amount-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({currency}) *
              </label>
              <input
                id="expense-amount-input"
                type="number"
                step="any"
                min="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Paid by & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-paid-by-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Paid by *
              </label>
              <select
                id="expense-paid-by-select"
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expense-date-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                id="expense-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => {
                const cfg = CATEGORY_CONFIG[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    id={`cat-btn-${catKey}`}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] truncate w-full text-center">{cfg.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Mode Selector */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Split Options
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  id="btn-split-mode-equal"
                  type="button"
                  onClick={() => setSplitMode('equal')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    splitMode === 'equal'
                      ? 'bg-white font-semibold text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Equally
                </button>
                <button
                  id="btn-split-mode-exact"
                  type="button"
                  onClick={() => setSplitMode('exact')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    splitMode === 'exact'
                      ? 'bg-white font-semibold text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Exact Amounts
                </button>
              </div>
            </div>

            {/* Split Mode: Equal */}
            {splitMode === 'equal' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Split between ({activeCount} of 7):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-select-all-members"
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      All 7
                    </button>
                  </div>
                </div>

                {/* Member Checkbox Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {people.map((p) => {
                    const isChecked = !!selectedMembers[p.id];
                    return (
                      <button
                        key={p.id}
                        id={`chk-member-${p.id}`}
                        type="button"
                        onClick={() => handleToggleMember(p.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {numericAmount > 0 && activeCount > 0 && (
                  <p className="text-xs text-emerald-800 font-medium pt-1 text-right">
                    Each person owes:{' '}
                    <strong className="font-bold text-sm">
                      {formatCurrency(sharePerPerson, currency)}
                    </strong>
                  </p>
                )}
              </div>
            )}

            {/* Split Mode: Exact */}
            {splitMode === 'exact' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Enter exact amount for each member:</span>
                  <span
                    className={`font-semibold ${
                      Math.abs(exactDifference) < 0.05
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {Math.abs(exactDifference) < 0.05
                      ? '✓ Balanced'
                      : `Remaining: ${formatCurrency(exactDifference, currency)}`}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {people.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">{currency}</span>
                        <input
                          id={`input-exact-${p.id}`}
                          type="number"
                          step="any"
                          min="0"
                          value={exactAmounts[p.id] || ''}
                          onChange={(e) => handleExactChange(p.id, e.target.value)}
                          placeholder="0"
                          className="w-20 px-2 py-0.5 text-right font-medium bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="expense-notes-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              id="expense-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UPI Ref #, Bill link, extra details"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              id="btn-cancel-expense"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-expense"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              {initialExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
