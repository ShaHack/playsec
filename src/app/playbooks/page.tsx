"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playbookService } from "@/services/playbookService";
import { AudioPlaybook } from "@/types/playbook";
import { preloadAudioTrack } from "@/utils/audioPreloader";
import { 
  Search, X, Volume2, Calendar, Users, Bookmark, Play
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {playbooksList.map((p) => {
                const difficultyStyle = DIFFICULTY_STYLES[p.difficulty] || "bg-[#141A22] text-[#A8B3C5] border border-[#2A3442]";
                const displayDate = p.updated_date
                  ? new Date(p.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recently Updated";
                const isBookmarked = bookmarkedIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className="group flex flex-col rounded-xl border border-[#2A3442] bg-[#141A22]/90 backdrop-blur-sm hover:border-[#3B82F6]/50 hover:shadow-[0_4px_20px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                  >
                    {/* Fixed 16:9 Aspect Ratio Header Image Container */}
                    <div className="relative aspect-video w-full bg-[#0B0F14] overflow-hidden border-b border-[#2A3442]/60 select-none rounded-t-xl flex items-center justify-center">
                      {p.cover_image ? (
                        <Image
                          src={p.cover_image}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#A8B3C5]">
                          <Volume2 className="h-7 w-7 opacity-70" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141A22] via-transparent to-black/30 pointer-events-none z-10" />
                      
                      {/* Difficulty Badge */}
                      <span className={`absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${difficultyStyle}`}>
                        {p.difficulty}
                      </span>

                      {/* Duration Chip */}
                      <span className="absolute top-2.5 right-2.5 z-20 bg-[#0B0F14]/80 text-[#3B82F6] backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border border-[#2A3442]/60 flex items-center gap-1">
                        <Volume2 className="h-2.5 w-2.5" />
                        {p.duration}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug mb-1 group-hover:text-[#3B82F6] transition-colors line-clamp-1">
                          {p.title}
                        </h3>

                        {/* Author & Date Metadata */}
                        <div className="flex items-center gap-2 mb-2 text-[9px] text-[#A8B3C5]/80 select-none">
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <Users className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                            {p.author}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                            {displayDate}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-[#A8B3C5]/90 leading-relaxed mb-3 line-clamp-2">
                          {p.description}
                        </p>
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-[#2A3442]/40">
                        <Link
                          href={`/playbooks/${p.slug}`}
                          onMouseEnter={() => {
                            playbookService.getPlaybookBySlug(p.slug);
                            if (p.audio_url) preloadAudioTrack(p.audio_url, "metadata");
                          }}
                          className="flex-1 h-7.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none shadow-sm shadow-blue-500/20"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          Listen
                        </Link>
                        
                        <button
                          onClick={(e) => handleBookmarkToggle(p.id, e)}
                          className={`h-7.5 w-7.5 rounded-lg border flex items-center justify-center transition-all select-none ${
                            isBookmarked 
                              ? "bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6]"
                              : "bg-[#0B0F14] border-[#2A3442] text-[#A8B3C5] hover:text-white hover:border-slate-500"
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
