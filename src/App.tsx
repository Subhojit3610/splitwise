/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Person, Expense, Settlement } from './types';
import {
  INITIAL_PEOPLE,
  SAMPLE_EXPENSES,
  SAMPLE_SETTLEMENTS,
} from './data/initialData';
import { calculateBalances, simplifyDebts } from './utils/splitwise';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { MemberBalances } from './components/MemberBalances';
import { SettlementPlan } from './components/SettlementPlan';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { SettleModal } from './components/SettleModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { ShareModal } from './components/ShareModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';

const STORAGE_KEY_PEOPLE = 'splitwise_7_people';
const STORAGE_KEY_EXPENSES = 'splitwise_7_expenses';
const STORAGE_KEY_SETTLEMENTS = 'splitwise_7_settlements';
const STORAGE_KEY_CURRENCY = 'splitwise_7_currency';

export default function App() {
  // People state (7 friends)
  const [people] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PEOPLE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PEOPLE;
  });

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return SAMPLE_EXPENSES;
  });

  // Settlements state
  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTLEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return SAMPLE_SETTLEMENTS;
  });

  // Currency
  const [currency, setCurrency] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CURRENCY) || '₹';
    } catch {
      return '₹';
    }
  });

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState<{
    fromId?: string;
    toId?: string;
    amount?: number;
  }>({});

  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Person | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
    } catch {
      // ignore
    }
  }, [people]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch {
      // ignore
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTLEMENTS, JSON.stringify(settlements));
    } catch {
      // ignore
    }
  }, [settlements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
    } catch {
      // ignore
    }
  }, [currency]);

  // Derived calculations
  const balances = useMemo(() => {
    return calculateBalances(people, expenses, settlements);
  }, [people, expenses, settlements]);

  const transfers = useMemo(() => {
    return simplifyDebts(people, balances);
  }, [people, balances]);

  const totalSpend = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingId
            ? { ...expenseData, id: editingId, createdAt: exp.createdAt }
            : exp
        )
      );
    } else {
      const newExp: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newExp, ...prev]);
    }
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveSettlement = (
    settlementData: Omit<Settlement, 'id' | 'createdAt'>
  ) => {
    const newSettle: Settlement = {
      ...settlementData,
      id: `settle-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setSettlements((prev) => [newSettle, ...prev]);
  };

  const handleDeleteSettlement = (id: string) => {
    setSettlements((prev) => prev.filter((s) => s.id !== id));
  };

  const handleQuickSettle = (fromId: string, toId: string, amount: number) => {
    setSettlePrefill({ fromId, toId, amount });
    setIsSettleModalOpen(true);
  };

  const handleResetToSample = () => {
    setExpenses(SAMPLE_EXPENSES);
    setSettlements(SAMPLE_SETTLEMENTS);
  };

  const handleClearAll = () => {
    setExpenses([]);
    setSettlements([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        people={people}
        currency={currency}
        onCurrencyChange={setCurrency}
        onAddExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onSettleUp={() => {
          setSettlePrefill({});
          setIsSettleModalOpen(true);
        }}
        onShare={() => setIsShareModalOpen(true)}
        onReset={() => setIsResetModalOpen(true)}
        onSelectPerson={(p) => setSelectedPersonForDetail(p)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards Row */}
        <MetricCards
          totalSpend={totalSpend}
          totalExpensesCount={expenses.length}
          transfers={transfers}
          currency={currency}
        />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column: History & Activities */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <ExpenseList
              expenses={expenses}
              settlements={settlements}
              people={people}
              currency={currency}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onDeleteSettlement={handleDeleteSettlement}
            />
          </div>

          {/* Right Column: Settlement Plan & Member Balances */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Simplified Repayment Matrix */}
            <SettlementPlan
              transfers={transfers}
              people={people}
              currency={currency}
              onQuickSettle={handleQuickSettle}
              onShare={() => setIsShareModalOpen(true)}
            />

            {/* 7 Member Balances */}
            <MemberBalances
              people={people}
              balances={balances}
              currency={currency}
              onSelectPerson={(p) => setSelectedPersonForDetail(p)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        people={people}
        currency={currency}
        initialExpense={editingExpense}
      />

      <SettleModal
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false);
          setSettlePrefill({});
        }}
        onSave={handleSaveSettlement}
        people={people}
        currency={currency}
        defaultFromId={settlePrefill.fromId}
        defaultToId={settlePrefill.toId}
        defaultAmount={settlePrefill.amount}
      />

      <MemberDetailModal
        person={selectedPersonForDetail}
        onClose={() => setSelectedPersonForDetail(null)}
        people={people}
        expenses={expenses}
        settlements={settlements}
        balances={balances}
        currency={currency}
        onSettleWith={(fromId, toId, amount) => {
          handleQuickSettle(fromId, toId, amount);
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        people={people}
        expenses={expenses}
        settlements={settlements}
        currency={currency}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetToSample={handleResetToSample}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
