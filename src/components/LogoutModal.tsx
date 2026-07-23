"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-sm rounded border border-[#2A3442] bg-[#141A22] p-6 shadow-2xl relative text-left"
        >
          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Icon */}
          <div className="h-10 w-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mb-4">
            <LogOut className="h-5 w-5 text-[#EF4444]" />
          </div>

          <h3 className="text-base font-bold text-white mb-2 tracking-tight">
            Sign Out
          </h3>

          <p className="text-xs text-[#A8B3C5] leading-relaxed mb-6">
            Are you sure you want to sign out of your PlaySec account?
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border border-[#2A3442] bg-[#0B0F14] hover:bg-[#141A22] text-[#A8B3C5] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
