import React, { useState, useEffect } from 'react';
import { Person, Settlement } from '../types';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  people: Person[];
  currency: string;
  defaultFromId?: string;
  defaultToId?: string;
  defaultAmount?: number;
}

export const SettleModal: React.FC<SettleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  people,
  currency,
  defaultFromId,
  defaultToId,
  defaultAmount,
}) => {
  const [fromPersonId, setFromPersonId] = useState(defaultFromId || people[0]?.id || 'lokesh');
  const [toPersonId, setToPersonId] = useState(
    defaultToId || people[1]?.id || 'subhajit'
  );
  const [amountStr, setAmountStr] = useState(
    defaultAmount !== undefined ? defaultAmount.toString() : ''
  );
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultFromId) setFromPersonId(defaultFromId);
    if (defaultToId) setToPersonId(defaultToId);
    if (defaultAmount !== undefined) setAmountStr(defaultAmount.toString());
    setError(null);
  }, [defaultFromId, defaultToId, defaultAmount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);

    if (fromPersonId === toPersonId) {
      setError('Payer and receiver must be different people.');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    onSave({
      fromPersonId,
      toPersonId,
      amount: Math.round(amount * 100) / 100,
      currency,
      date,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const fromPerson = people.find((p) => p.id === fromPersonId);
  const toPerson = people.find((p) => p.id === toPersonId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record a Settlement</h3>
              <p className="text-xs text-slate-500">Record a debt repayment between 2 friends</p>
            </div>
          </div>
          <button
            id="btn-close-settle-modal"
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Visual direction card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full ${fromPerson?.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center text-xs font-bold`}>
                {fromPerson?.initials}
              </span>
              <span className="text-xs font-semibold text-slate-800">{fromPerson?.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
              <span>pays</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full ${toPerson?.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center text-xs font-bold`}>
                {toPerson?.initials}
              </span>
              <span className="text-xs font-semibold text-slate-800">{toPerson?.name}</span>
            </div>
          </div>

          {/* From & To Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settle-from-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Payer (Who paid) *
              </label>
              <select
                id="settle-from-select"
                value={fromPersonId}
                onChange={(e) => setFromPersonId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settle-to-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Receiver (Who got paid) *
              </label>
              <select
                id="settle-to-select"
                value={toPersonId}
                onChange={(e) => setToPersonId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settle-amount-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({currency}) *
              </label>
              <input
                id="settle-amount-input"
                type="number"
                step="any"
                min="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="settle-date-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                id="settle-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="settle-notes-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method / Note
            </label>
            <input
              id="settle-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Google Pay, PhonePe, Cash, Bank transfer"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              id="btn-cancel-settle"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-settle"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
