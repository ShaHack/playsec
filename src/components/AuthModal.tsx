"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingAction?: any;
}

export default function AuthModal({
  isOpen,
  onClose,
  title = "Authentication Required",
  message = "Please sign in with Google to access audio playback, downloadable resources, and community features.",
  pendingAction,
}: AuthModalProps) {
  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    if (pendingAction) {
      try {
        localStorage.setItem("playsec_pending_action", JSON.stringify(pendingAction));
      } catch {
        // Silently handle storage error
      }
    }
    loginWithGoogle();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md rounded border border-[#2A3442] bg-[#141A22] p-6 shadow-2xl relative text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Icon */}
          <div className="h-10 w-10 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-4">
            <Lock className="h-5 w-5 text-[#3B82F6]" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-[#A8B3C5] leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex h-10 items-center justify-center gap-2.5 px-4 rounded bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" aria-hidden="true">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.438a6.445 6.445 0 016.437-6.437c1.558 0 2.978.557 4.095 1.486L21.2 4.135C19.268 2.502 16.742 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.385 0 10.07-3.793 10.07-10.5 0-.66-.06-1.285-.2-1.715H12.24z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={onClose}
              className="w-full h-9 rounded border border-[#2A3442] bg-[#0B0F14] hover:bg-[#141A22] text-[#A8B3C5] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
