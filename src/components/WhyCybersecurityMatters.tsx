"use client";

import { ShieldAlert, Terminal, Lock } from "lucide-react";

export default function WhyCybersecurityMatters() {
  return (
    <section className="py-12 bg-[#09090B] border-b border-[#27272A] relative overflow-hidden select-text">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
        <div className="rounded border border-[#27272A] bg-[#18181B] p-8 md:p-10 shadow-sm relative overflow-hidden">
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded mb-4">
              <ShieldAlert className="h-3.5 w-3.5 stroke-[2]" />
              The Threat Landscape
            </span>
            
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight text-white">
              Application Security Is No Longer Optional
            </h2>
            
            <p className="mt-4 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Over <strong className="text-white font-bold">80% of modern security breaches</strong> exploit vulnerabilities at the application layer. In a world of automated threat scanners and rapid deployments, writing secure code and understanding defensive operations is a critical engineering requirement.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto pt-6 border-t border-[#27272A]">
              <div className="flex items-center gap-2.5 text-xs text-[#A1A1AA]">
                <Terminal className="h-4 w-4 text-[#2563EB] stroke-[1.5]" />
                <span>Automated vulnerability scans</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#A1A1AA]">
                <Lock className="h-4 w-4 text-[#2563EB] stroke-[1.5]" />
                <span>Cryptographic validation checks</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
