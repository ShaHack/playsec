"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function ExplorePlaybooksCTA() {
  return (
    <section id="explore-library" className="py-12 bg-[#09090B] border-b border-[#27272A] select-text">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10 text-center">
        
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#18181B] text-[#2563EB] mb-4">
            <Compass className="h-5 w-5 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Ready to Build Secure Systems?
          </h2>
          
          <p className="mt-3 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
            Enter the PlaySec library to browse our fully verified, peer-reviewed cybersecurity runbooks and structure your learning pathway.
          </p>

          <div className="mt-6">
            <Link 
              href="/playbooks"
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#2563EB] px-6 text-xs font-bold text-white transition-all hover:bg-blue-600 active:scale-[0.98] select-none"
            >
              Explore Playbooks
              <ArrowRight className="h-4 w-4 stroke-[2]" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
