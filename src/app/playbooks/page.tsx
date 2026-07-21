"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playbooks } from "@/playbooks/products";
import { 
  Search, X, BookOpen, ChevronRight, 
  Volume2, Download, Calendar, Globe
} from "lucide-react";

const DIFFICULTY_STYLES = {
  "Beginner": "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
  "Intermediate": "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
  "Advanced": "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
};

export default function PlaybooksLibrary() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      return (
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn((prev) => !prev)} />

      <main className="min-h-screen bg-[#0E1117] text-[#A1A1AA] py-10 relative overflow-hidden select-text">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.015,
            backgroundImage: "linear-gradient(#27272A 1px, transparent 1px), linear-gradient(90deg, #27272A 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        <div className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA] block mb-1">
                SecOps Audio Briefings
              </span>
              <h1 className="text-2xl font-extrabold text-[#FAFAFA] tracking-tight leading-tight">
                Playbook Library
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                Explore our catalog of professional, peer-reviewed incident response and vulnerability briefings.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#A1A1AA]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search playbooks..."
                className="w-full h-9 pl-10 pr-8 rounded border border-[#27272A] bg-[#18181B] text-xs text-[#FAFAFA] placeholder:text-[#A1A1AA] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                  aria-label="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Grid display (High quality card format) */}
          {filteredPlaybooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaybooks.map((p) => {
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col rounded-lg border border-[#27272A] bg-[#18181B] p-5 hover:border-zinc-700 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Header Row with Thumbnail and Title/Tags */}
                    <div className="flex gap-4 items-start mb-4">
                      {/* Small square thumbnail */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[6px] border border-[#27272A] bg-[#0E1117] select-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Title & Badge Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                            {p.category}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${DIFFICULTY_STYLES[p.difficulty]}`}>
                            {p.difficulty}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#FAFAFA] tracking-tight leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4 flex-1 line-clamp-2">
                      {p.description}
                    </p>

                    {/* Metadata details container */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] text-[#A1A1AA] mb-5 border-t border-[#27272A] pt-4 select-none">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
                        <span>Duration: 08:15</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>Languages: EN, TA, HI</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>Updated: {p.updatedDate}</span>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#27272A]">
                      <Link
                        href={`/playbooks/${p.slug}`}
                        className="flex-1 h-9 rounded-[6px] bg-[#2563EB] hover:bg-blue-600 text-[#FAFAFA] font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none shadow-none"
                      >
                        Listen Briefing
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      
                      <button
                        onClick={() => alert("Downloading briefing audio files...")}
                        className="h-9 w-9 rounded-[6px] border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] hover:border-zinc-600 flex items-center justify-center transition-all select-none"
                        title="Download audio briefing file"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-[#27272A] rounded-lg bg-[#18181B]/40 select-none">
              <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#FAFAFA] mb-0.5">No playbooks found</h3>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                No playbook titles, descriptions, or slugs match your search criteria.
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
