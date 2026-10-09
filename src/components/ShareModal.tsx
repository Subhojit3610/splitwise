import React, { useState } from 'react';
import { Person, Expense, Settlement } from '../types';
import { generateWhatsAppSummary } from '../utils/splitwise';
import { X, Copy, Check, Share2, Download, MessageSquare } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  expenses: Expense[];
  settlements: Settlement[];
  currency: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  people,
  expenses,
  settlements,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summaryText = generateWhatsAppSummary(people, expenses, settlements, currency);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppOpen = () => {
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleExportJSON = () => {
    const data = {
      groupName: '7 Friends Group',
      members: people.map((p) => p.name),
      currency,
      expenses,
      settlements,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitwise-7-friends-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share Group Summary</h3>
              <p className="text-xs text-slate-500">Send balances and settlement plan to the group</p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              WhatsApp / Message Preview
            </label>
            <textarea
              readOnly
              rows={9}
              value={summaryText}
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              id="btn-copy-summary"
              type="button"
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              id="btn-open-whatsapp"
              type="button"
              onClick={handleWhatsAppOpen}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Open WhatsApp directly"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open App</span>
            </button>

            <button
              id="btn-export-backup"
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Download backup file"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
