"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyPlaySec from "@/components/WhyPlaySec";
import {
  ArrowRight,
  Award,
  Users,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn((p) => !p)} />

      <main className="flex-1 select-text bg-[#09090B] text-[#FAFAFA]">
        
        {/* ════════════════════════════════════════════ */}
        {/* 1. HERO — Centered, Spacious & Clean         */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative w-full border-b border-[#27272A] py-16 md:py-24 bg-[#121214]">
          {/* Subtle background lines */}
          <div className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0.012,
              backgroundImage: "linear-gradient(#27272A 1px, transparent 1px), linear-gradient(90deg, #27272A 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          <div className="relative z-10 mx-auto max-w-[960px] px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded mb-6">
              <Award className="h-3.5 w-3.5" />
              Professional Cybersecurity Learning
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Professional Cybersecurity Playbooks
            </h1>
            
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A1A1AA] max-w-2xl mx-auto">
              Learn faster with expert-reviewed playbooks, real-world attack scenarios, and practical defensive security guidance.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/playbooks"
                className="group flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded bg-[#2563EB] px-6 text-xs font-bold text-white transition-all hover:bg-blue-600 select-none shadow-none">
                Explore Playbook Library
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-[#27272A]/60 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-[#A1A1AA]">
              {["✓ Editorially reviewed", "✓ Updated weekly", "✓ Practical blueprints", "✓ Verified Security Guides"].map(label => (
                <span key={label} className="font-semibold">{label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 2. THREE CARDS (WhyPlaySec)                  */}
        {/* ════════════════════════════════════════════ */}
        <div className="bg-[#18181B]">
          <WhyPlaySec />
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* 3. COMMUNITY PREVIEW                          */}
        {/* ════════════════════════════════════════════ */}
        <section className="py-12 bg-[#09090B] border-b border-[#27272A]">
          <div className="mx-auto max-w-[1380px] px-6 lg:px-10 text-center py-4">
            <div className="max-w-xl mx-auto flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#18181B] text-[#2563EB] mb-4 border border-[#27272A]">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Connect with the PlaySec Community</h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                Have questions or suggestions regarding briefings? Search our verification indices or submit general support tickets directly to the SecOps team.
              </p>
              <Link
                href="/community"
                className="h-9 px-5 bg-[#2563EB] rounded font-bold text-white text-xs hover:bg-blue-600 inline-flex items-center gap-1.5 transition-colors select-none"
              >
                Go to Community Hub
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
