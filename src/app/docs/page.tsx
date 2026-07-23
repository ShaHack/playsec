"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Book, Play, Folder, Search, Bookmark, Globe, HelpCircle } from "lucide-react";

export default function DocsPage() {

  const docSections = [
    {
      icon: <Book className="h-5 w-5 text-[#2563EB]" />,
      title: "Getting Started",
      content: "Welcome to PlaySec. Access the Playbook Library using the header navigation. We recommend starting with Foundation level briefs to review basic application security principles and threat mechanics before progressing to Practitioner incident guides.",
    },
    {
      icon: <Play className="h-5 w-5 text-[#2563EB]" />,
      title: "Using Audio Playbooks",
      content: "Each playbook features a integrated media console. Select playback speeds (1.0x to 2.0x) to match your pacing. Scrub to any bookmark point in the timeline, or download audio files offline for diagnostic walkthroughs on target systems.",
    },
    {
      icon: <Folder className="h-5 w-5 text-[#2563EB]" />,
      title: "Using the Knowledge Library",
      content: "The Knowledge Library serves as an index of configuration matrices, rule definitions, and OWASP/NIST mapping tables. Access reference guidelines directly under each playbook details view.",
    },
    {
      icon: <Search className="h-5 w-5 text-[#2563EB]" />,
      title: "Searching Content",
      content: "Use the primary search input on the top-right of the navigation bar to locate playbooks, code metrics, or FAQs. The filter evaluates titles, descriptions, and tag markers in real-time.",
    },
    {
      icon: <Bookmark className="h-5 w-5 text-[#2563EB]" />,
      title: "Bookmarks & Saved Content",
      content: "Authenticate your profile session to save active playbooks, configure alerts for roadmap changes, and pin configuration checklists for review. Non-authenticated users can download briefings directly.",
    },
    {
      icon: <Globe className="h-5 w-5 text-[#2563EB]" />,
      title: "Supported Languages",
      content: "PlaySec playbooks support multi-language tracks including English, Tamil, and Hindi. Change language streams using the Audio Language bar located above the media player to sync audio feeds instantly.",
    },
    {
      icon: <HelpCircle className="h-5 w-5 text-[#2563EB]" />,
      title: "Frequently Asked Questions",
      content: "Refer to the Community Hub for platform rules, support routes, and operations notices. Use the support ticket form to submit requests directly to the SecOps review desk.",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-1 select-text bg-[#09090B] text-[#FAFAFA] min-h-screen">
        
        {/* Hero Section */}
        <section className="relative w-full border-b border-[#27272A] py-16 bg-[#121214]">
          <div className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0.012,
              backgroundImage: "linear-gradient(#27272A 1px, transparent 1px), linear-gradient(90deg, #27272A 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          <div className="relative z-10 mx-auto max-w-[960px] px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded mb-6">
              Documentation
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Documentation
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A1A1AA] max-w-2xl mx-auto">
              Everything you need to use the PlaySec platform effectively.
            </p>
          </div>
        </section>

        {/* Content Grid */}
        <section className="py-12 mx-auto max-w-[1380px] px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docSections.map((sec, idx) => (
              <div key={idx} className="rounded border border-[#27272A] bg-[#18181B] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[#09090B] border border-[#27272A]">
                      {sec.icon}
                    </div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">{sec.title}</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
