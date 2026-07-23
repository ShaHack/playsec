"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playbookService } from "@/services/playbookService";
import { AudioPlaybook } from "@/types/playbook";
import { 
  Search, X, Volume2, Calendar, Users, Globe, Bookmark, Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DIFFICULTY_STYLES = {
  "Beginner": "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
  "Intermediate": "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
  "Advanced": "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
};

export default function PlaybooksLibrary() {
  const { isLoggedIn, loginWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [playbooksList, setPlaybooksList] = useState<AudioPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await playbookService.getAllPlaybooks(searchQuery);
        setPlaybooksList(data);
      } catch (err: unknown) {
        setErrorMsg((err as Error).message || "Unable to connect to PlaySec servers.");
        setPlaybooksList([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery]);

  const handleBookmarkToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      loginWithGoogle();
      return;
    }
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0B0F14] text-[#F3F4F6] py-12 relative overflow-hidden select-text">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.015,
            backgroundImage: "linear-gradient(#2A3442 1px, transparent 1px), linear-gradient(90deg, #2A3442 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        <div className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] block mb-1">
                SecOps Audio Playbooks
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                Professional Security Audio Briefings
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#A8B3C5] leading-relaxed">
                Expert-reviewed cybersecurity audio briefings for learning anywhere.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#A8B3C5]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search briefings..."
                className="w-full h-9 pl-9.5 pr-8 rounded border border-[#2A3442] bg-[#141A22] text-xs text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none transition-colors"
                style={{ paddingLeft: "2.3rem" }}
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

          {errorMsg && (
            <div className="mb-6 text-xs font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 p-4 rounded">
              {errorMsg}
            </div>
          )}

          {/* Grid display: Max 3 cards per row on desktop. Tighter spacing. */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto mb-4" />
              <p className="text-xs text-[#A8B3C5]">Querying briefings registry...</p>
            </div>
          ) : playbooksList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playbooksList.map((p) => {
                const difficultyStyle = DIFFICULTY_STYLES[p.difficulty] || "bg-[#141A22] text-[#A8B3C5] border border-[#2A3442]";
                const displayDate = p.updated_date
                  ? new Date(p.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recently Updated";
                const isBookmarked = bookmarkedIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className="group flex flex-col rounded-lg border border-[#2A3442] bg-[#141A22] hover:border-[#3B82F6] hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-200 overflow-hidden shadow-sm"
                  >
                    {/* Cover Image Thumbnail */}
                    <div className="relative h-36 w-full bg-[#0B0F14] overflow-hidden border-b border-[#2A3442] select-none">
                      {p.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.cover_image}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#A8B3C5]">
                          <Volume2 className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#0B0F14]/40" />
                      
                      {/* Difficulty Badge */}
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${difficultyStyle}`}>
                        {p.difficulty}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Specs & Date row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[9px] font-semibold text-[#A8B3C5] select-none">
                          <span className="flex items-center gap-1">
                            <Volume2 className="h-3 w-3 text-[#3B82F6]" />
                            {p.duration}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {displayDate}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-white tracking-tight leading-snug mb-1.5 group-hover:text-[#3B82F6] transition-colors line-clamp-2 min-h-[40px]">
                          {p.title}
                        </h3>

                        {/* Details row: Author/Language */}
                        <div className="flex items-center gap-2 mb-2 text-[9px] text-[#A8B3C5] select-none">
                          <Users className="h-3 w-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[130px]">{p.author}</span>
                          <span>•</span>
                          <Globe className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{p.language}</span>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-[#A8B3C5] leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
                          {p.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-[#2A3442]/60">
                        <Link
                          href={`/playbooks/${p.slug}`}
                          className="flex-1 h-8 rounded bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none shadow-none"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                          Listen
                        </Link>
                        
                        <button
                          onClick={(e) => handleBookmarkToggle(p.id, e)}
                          className={`h-8 w-8 rounded border flex items-center justify-center transition-all select-none ${
                            isBookmarked 
                              ? "bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6]"
                              : "bg-[#0B0F14] border-[#2A3442] text-[#A8B3C5] hover:text-white"
                          }`}
                          title="Bookmark briefing"
                        >
                          <Bookmark className="h-3.5 w-3.5 fill-current" style={{ fillOpacity: isBookmarked ? 1 : 0 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !errorMsg && (
              <div className="text-center py-16 border border-dashed border-[#2A3442] rounded bg-[#141A22]/40 select-none">
                <Volume2 className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-0.5">No resources have been published yet.</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Audio playbooks list is currently empty.
                </p>
              </div>
            )
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
