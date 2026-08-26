"use client";

import Link from "next/link";
import PlaySecLogo from "@/components/PlaySecLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#D9E4EA] bg-white py-8 select-none">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
        
        {/* Top brand row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#D9E4EA]">
          
          <div className="flex items-center">
            <PlaySecLogo size={28} showText={true} />
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            <Link 
              href="/about"
              className="footer-link text-[#B8BCBF] hover:text-[#E1E3E5] cursor-pointer transition-colors duration-160"
            >
              About
            </Link>
            <Link 
              href="/docs"
              className="footer-link text-[#B8BCBF] hover:text-[#E1E3E5] cursor-pointer transition-colors duration-160"
            >
              Documentation
            </Link>
            <Link 
              href="/privacy"
              className="footer-link text-[#B8BCBF] hover:text-[#E1E3E5] cursor-pointer transition-colors duration-160"
            >
              Privacy
            </Link>
            <Link 
              href="/contact"
              className="footer-link text-[#B8BCBF] hover:text-[#E1E3E5] cursor-pointer transition-colors duration-160"
            >
              Contact
            </Link>
          </div>

          {/* Right Side: Empty to balance logo (No social media links) */}
          <div className="hidden sm:block w-28" />

        </div>

        {/* Bottom copyright row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#60717D]">
          <span>&copy; {currentYear} PlaySec. All rights reserved.</span>
          <span className="font-mono text-[10px] text-[#8193A0]">build 1.4.2-b889</span>
        </div>

      </div>
    </footer>
  );
}
