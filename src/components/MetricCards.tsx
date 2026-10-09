import React from 'react';
import { formatCurrency } from '../utils/splitwise';
import { Wallet, Users, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { DebtTransfer } from '../types';

interface MetricCardsProps {
  totalSpend: number;
  totalExpensesCount: number;
  transfers: DebtTransfer[];
  currency: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalSpend,
  totalExpensesCount,
  transfers,
  currency,
}) => {
  const avgPerPerson = totalSpend / 7;
  const isAllSettled = transfers.length === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Spending */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Total Group Spending</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalSpend, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Across {totalExpensesCount} {totalExpensesCount === 1 ? 'expense' : 'expenses'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      {/* Average Share / Person */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Avg. Per Person (7 Members)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(avgPerPerson, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Fair equal division base
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Settlement Status */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Settlement Status</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {isAllSettled ? 'All Settled Up' : `${transfers.length} Transfers`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAllSettled
              ? 'Zero outstanding group balances'
              : 'Simplified minimum payments to clear'}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isAllSettled
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          {isAllSettled ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <ArrowRightLeft className="w-5 h-5" />
          )}
        </div>
      </div>
    </div>
  );
};
