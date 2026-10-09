import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Ticket,
  Zap,
  Tag,
  CircleDollarSign,
} from 'lucide-react';
import { ExpenseCategory } from '../types';

interface CategoryIconProps {
  category: ExpenseCategory;
  className?: string;
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string }
> = {
  food: {
    label: 'Food & Dining',
    icon: Utensils,
    bg: 'bg-orange-100',
    text: 'text-orange-700',
  },
  travel: {
    label: 'Travel & Cab',
    icon: Car,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  stay: {
    label: 'Stay & Hotel',
    icon: Home,
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
  },
  groceries: {
    label: 'Groceries & Supplies',
    icon: ShoppingBag,
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
  },
  entertainment: {
    label: 'Entertainment & Fun',
    icon: Ticket,
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
  shopping: {
    label: 'Shopping',
    icon: Tag,
    bg: 'bg-pink-100',
    text: 'text-pink-700',
  },
  utilities: {
    label: 'Utilities & Bills',
    icon: Zap,
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  other: {
    label: 'General / Other',
    icon: CircleDollarSign,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  },
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5' }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;
  return (
    <div className={`p-2 rounded-lg flex items-center justify-center ${config.bg} ${config.text}`}>
      <Icon className={className} />
    </div>
  );
};
