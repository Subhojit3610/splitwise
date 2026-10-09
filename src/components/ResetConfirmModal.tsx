import React from 'react';
import { X, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToSample: () => void;
  onClearAll: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onResetToSample,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold">Reset Group Data</h3>
          </div>
          <button
            id="btn-close-reset-modal"
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-600">
          <p>
            Choose how you would like to reset the expense records for Lokesh, DNP, Subhajit, Anike, Amit, Avik, and Sameek:
          </p>

          <div className="space-y-2.5">
            <button
              id="btn-confirm-load-sample"
              type="button"
              onClick={() => {
                onResetToSample();
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 font-medium flex items-center gap-3 text-left transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-emerald-950">
                  Reload Sample Trip Data
                </div>
                <div className="text-[11px] text-emerald-700">
                  Populate with villa booking, dinner, fuel, and activities
                </div>
              </div>
            </button>

            <button
              id="btn-confirm-clear-all"
              type="button"
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-900 font-medium flex items-center gap-3 text-left transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-rose-950">
                  Clear Everything (Start Clean)
                </div>
                <div className="text-[11px] text-rose-700">
                  Wipe all expenses & settlements to start fresh from ₹0
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            id="btn-cancel-reset"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
