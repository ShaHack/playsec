"use client";

import { Shield } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#18181B] text-[#FAFAFA] border-t border-[#27272A] py-10 select-none">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#27272A] select-text">
          
          {/* Left Side: Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2563EB] text-white">
              <Shield className="h-4.5 w-4.5 stroke-[1.5]" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              PLAY<span className="text-[#2563EB]">SEC</span>
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#A1A1AA]">
            <span 
              onClick={() => alert("Opening About story...")}
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              About
            </span>
            <span 
              onClick={() => alert("Opening Documentation guides...")}
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Documentation
            </span>
            <span 
              onClick={() => alert("Opening Privacy Policy...")}
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Privacy
            </span>
            <span 
              onClick={() => alert("Opening Contact support...")}
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Contact
            </span>
          </div>

          {/* Right Side: GitHub Icon */}
          <div className="flex items-center text-[#A1A1AA]">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors" 
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
          <span>&copy; {currentYear} PlaySec. All rights reserved.</span>
          <span className="font-mono text-[10px] text-slate-700">build 1.4.2-b889</span>
        </div>

      </div>
    </footer>
  );
}
