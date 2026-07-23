"use client";

import { Shield } from "lucide-react";
import Link from "next/link";
import PlaySecLogo from "@/components/PlaySecLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#2A3442] bg-[#141A22] py-8 select-none">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
        
        {/* Top brand row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#2A3442]/60">
          
          <div className="flex items-center">
            <PlaySecLogo size={28} showText={true} />
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#A8B3C5]">
            <Link 
              href="/about"
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              About
            </Link>
            <Link 
              href="/docs"
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Documentation
            </Link>
            <Link 
              href="/privacy"
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/contact"
              className="hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right Side: Empty to balance logo (No social media links) */}
          <div className="hidden sm:block w-28" />

        </div>

        {/* Bottom copyright row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A8B3C5]">
          <span>&copy; {currentYear} PlaySec. All rights reserved.</span>
          <span className="font-mono text-[10px] text-slate-700">build 1.4.2-b889</span>
        </div>

      </div>
    </footer>
  );
}
