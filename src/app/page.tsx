"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyPlaySec from "@/components/WhyPlaySec";
import {
  ArrowRight,
  Award,
  Users,
  ChevronRight
} from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 select-text bg-[#F5F8FA] text-[#17232D]">
        
        {/* ════════════════════════════════════════════ */}
        {/* 1. HERO — Centered, Spacious & Clean         */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative w-full border-b border-[#D9E4EA] py-16 md:py-24 bg-white">
          {/* Subtle background lines */}
          <div className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0.4,
              backgroundImage: "linear-gradient(var(--color-border-color, #D9E4EA) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-color, #D9E4EA) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          <div className="relative z-10 mx-auto max-w-[960px] px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B57] bg-[#E9F1F5] border border-[#D9E4EA] px-3 py-1 rounded mb-6">
              <Award className="h-3.5 w-3.5" />
              Professional Cybersecurity Learning
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17232D] leading-tight">
              Professional Cybersecurity Playbooks
            </h1>
            
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#60717D] max-w-2xl mx-auto">
              Learn faster with expert-reviewed playbooks, real-world attack scenarios, and practical defensive security guidance.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/playbooks"
                className="group flex h-10 w-full sm:w-auto items-center justify-center gap-2 px-6 text-xs font-bold playsec-cta-btn select-none">
                Explore Playbook Library
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-[#D9E4EA] flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-[#60717D]">
              {["✓ Editorially reviewed", "✓ Updated weekly", "✓ Practical blueprints", "✓ Verified Security Guides"].map(label => (
                <span key={label} className="font-semibold">{label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 2. THREE CARDS (WhyPlaySec)                  */}
        {/* ════════════════════════════════════════════ */}
        <div className="bg-white">
          <WhyPlaySec />
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* 3. COMMUNITY PREVIEW                          */}
        {/* ════════════════════════════════════════════ */}
        <section className="py-12 bg-[#F5F8FA] border-b border-[#D9E4EA]">
          <div className="mx-auto max-w-[1380px] px-6 lg:px-10 text-center py-4">
            <div className="max-w-xl mx-auto flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-[#173B57] mb-4 border border-[#D9E4EA]">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[#17232D] mb-2">Connect with the PlaySec Community</h2>
              <p className="text-xs sm:text-sm text-[#60717D] leading-relaxed mb-6">
                Have questions or suggestions regarding briefings? Search our verification indices or submit general support tickets directly to the SecOps team.
              </p>
              <Link
                href="/community"
                className="h-9 px-5 playsec-cta-btn font-bold text-xs inline-flex items-center gap-1.5 select-none"
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
