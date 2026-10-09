import React from 'react';
import { DebtTransfer, Person } from '../types';
import { formatCurrency } from '../utils/splitwise';
import { ArrowRight, CheckCircle2, Sparkles, Send } from 'lucide-react';

interface SettlementPlanProps {
  transfers: DebtTransfer[];
  people: Person[];
  currency: string;
  onQuickSettle: (fromId: string, toId: string, amount: number) => void;
  onShare: () => void;
}

export const SettlementPlan: React.FC<SettlementPlanProps> = ({
  transfers,
  people,
  currency,
  onQuickSettle,
  onShare,
}) => {
  const getPerson = (id: string) => people.find((p) => p.id === id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-slate-900">Simplified Repayments</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3" /> Minimized Transfers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            The quickest way to balance accounts among all 7 friends
          </p>
        </div>

        {transfers.length > 0 && (
          <button
            id="btn-share-repayments"
            type="button"
            onClick={onShare}
            className="text-xs font-medium text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}
      </div>

      {transfers.length === 0 ? (
        <div className="text-center py-8 px-4 bg-emerald-50/50 rounded-lg border border-dashed border-emerald-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-emerald-900">No debts to settle!</p>
          <p className="text-xs text-emerald-700 mt-1">
            Everyone is completely squared up. All 7 balances are zero.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t, idx) => {
            const debtor = getPerson(t.fromId);
            const creditor = getPerson(t.toId);

            return (
              <div
                key={`${t.fromId}-${t.toId}-${idx}`}
                id={`transfer-card-${t.fromId}-${t.toId}`}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Transfer Visual */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* From Debtor */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`w-8 h-8 rounded-full ${debtor?.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center text-xs font-bold`}
                    >
                      {debtor?.initials || t.fromName.slice(0, 2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {t.fromName}
                    </span>
                  </div>

                  {/* Arrow with Amount */}
                  <div className="flex items-center gap-1 px-2 text-slate-400">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* To Creditor */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`w-8 h-8 rounded-full ${creditor?.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center text-xs font-bold`}
                    >
                      {creditor?.initials || t.toName.slice(0, 2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {t.toName}
                    </span>
                  </div>
                </div>

                {/* Amount & Settle action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block">Pays</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency(t.amount, currency)}
                    </span>
                  </div>

                  <button
                    id={`btn-settle-transfer-${t.fromId}-${t.toId}`}
                    type="button"
                    onClick={() => onQuickSettle(t.fromId, t.toId, t.amount)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
