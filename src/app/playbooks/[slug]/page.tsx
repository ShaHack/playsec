"use client";

import { useState, useEffect, useMemo, use, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playbookService } from "@/services/playbookService";
import { AudioPlaybook } from "@/types/playbook";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, Volume2, Bookmark, Share2, 
  ChevronRight, Calendar, Globe,
  RotateCcw, RotateCw, Check, Download, Info, CheckCircle2, BookOpen
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PlaybookSlugPage({ params }: PageProps) {
  const { slug } = use(params);

  const [playbook, setPlaybook] = useState<AudioPlaybook | null>(null);
  const [relatedPlaybooks, setRelatedPlaybooks] = useState<AudioPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Tamil" | "Hindi">("English");
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const [currentTimeSec, setCurrentTimeSec] = useState(145);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(80);
  const durationSec = 580;
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load Playbook & Related dynamic briefings
  useEffect(() => {
    async function loadPlaybook() {
      setLoading(true);
      setErrorMsg("");
      try {
        const item = await playbookService.getPlaybookBySlug(slug);
        if (item) {
          setPlaybook(item);
          const all = await playbookService.getAllPlaybooks();
          setRelatedPlaybooks(all.filter((p) => p.slug !== slug).slice(0, 3));
        } else {
          setPlaybook(null);
        }
      } catch (e: any) {
        setErrorMsg(e.message || "Unable to connect to PlaySec servers.");
      } finally {
        setLoading(false);
      }
    }
    loadPlaybook();
  }, [slug]);

  // Persistence of language selector
  useEffect(() => {
    const saved = localStorage.getItem("playsec_audio_lang");
    if (saved === "English" || saved === "Tamil" || saved === "Hindi") {
      setSelectedLanguage(saved);
    }
  }, []);

  const handleLanguageChange = (lang: "English" | "Tamil" | "Hindi") => {
    setSelectedLanguage(lang);
    localStorage.setItem("playsec_audio_lang", lang);
    setToastMsg(`Switched briefing audio to ${lang}`);
    setTimeout(() => setToastMsg(""), 3000);
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 150);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isPlaying && playbook && playbook.audio_url) {
      const tickRate = 1000 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + 1;
          if (next >= durationSec) {
            setIsPlaying(false);
            setProgress(100);
            return durationSec;
          }
          setProgress((next / durationSec) * 100);
          return next;
        });
      }, tickRate);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbook, playbackSpeed]);

  const handleSkipForward = () => {
    setCurrentTimeSec((prev) => {
      const next = Math.min(durationSec, prev + 10);
      setProgress((next / durationSec) * 100);
      return next;
    });
  };

  const handleSkipBackward = () => {
    setCurrentTimeSec((prev) => {
      const next = Math.max(0, prev - 10);
      setProgress((next / durationSec) * 100);
      return next;
    });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    setCurrentTimeSec((val / 100) * durationSec);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMsg("Briefing URL copied to clipboard!");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const speedOptions = [1.0, 1.25, 1.5, 2.0];

  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn(prev => !prev)} />
        <main className="min-h-screen bg-[#0B0F14] flex items-center justify-center text-[#A8B3C5]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto mb-4" />
            <p className="text-xs">Loading briefing details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (errorMsg) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn(prev => !prev)} />
        <main className="min-h-screen bg-[#0B0F14] flex items-center justify-center text-[#EF4444] p-6">
          <div className="text-center max-w-md bg-[#141A22] border border-[#2A3442] p-6 rounded">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Operational Failure</h2>
            <p className="text-xs text-[#A8B3C5] leading-relaxed">{errorMsg}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!playbook) {
    notFound();
  }

  const displayDate = playbook.updated_at
    ? new Date(playbook.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Recently Updated";

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn(prev => !prev)} />
      
      <main className="min-h-screen bg-[#0B0F14] text-[#F3F4F6] py-10 relative overflow-hidden select-text">
        
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.015,
            backgroundImage: "linear-gradient(#2A3442 1px, transparent 1px), linear-gradient(90deg, #2A3442 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        <div className="relative z-10 mx-auto max-w-[840px] px-6">

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-[#141A22] border border-[#2A3442] text-white px-4 py-2.5 rounded shadow-sm text-xs font-semibold select-none"
              >
                <Check className="h-4 w-4 text-[#10B981]" />
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button link */}
          <div className="mb-4">
            <Link 
              href="/playbooks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8B3C5] hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Security Briefings
            </Link>
          </div>

          {/* ── AUDIO LANGUAGE SELECTOR BAR ── */}
          <div className="mb-4 flex items-center justify-between border border-[#2A3442] bg-[#141A22] px-4 py-2.5 rounded shadow-sm">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Audio Language</span>
            </div>
            <div className="flex items-center gap-1">
              {(["English", "Tamil", "Hindi"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all select-none ${
                    selectedLanguage === lang
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[#0B0F14] border border-[#2A3442] text-[#A8B3C5] hover:text-white hover:border-slate-500"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* SPOTIFY-STYLE AUDIO BOARD */}
          <section className="rounded border border-[#2A3442] bg-[#141A22] p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-sm">
            {/* Playbook Cover Art */}
            <div className="relative h-44 w-44 shrink-0 rounded border border-[#2A3442] bg-[#0B0F14] overflow-hidden select-none">
              {playbook.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={playbook.cover_image} 
                  alt={playbook.title} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#A8B3C5]">
                  <BookOpen className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Audio Details & Controls column */}
            <div className="flex-1 flex flex-col w-full text-center md:text-left">
              
              {/* Trust Tag Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2.5 text-[9px] font-bold uppercase tracking-wider text-[#A8B3C5]">
                <span className="flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Security Reviewed
                </span>
                <span className="bg-[#0B0F14] px-2 py-0.5 rounded border border-[#2A3442]">
                  v1.2 (Latest)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mb-2">
                {playbook.title}
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed text-[#A8B3C5] mb-4">
                {playbook.description}
              </p>

              {/* Central Audio Player Console */}
              <div className="bg-[#0B0F14] border border-[#2A3442] rounded p-4 mb-4 select-none">
                
                {/* Audio Seek bar */}
                <div className="space-y-1 mb-3">
                  <input 
                    type="range" 
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-[#2A3442] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                    aria-label="Audio progress slider"
                  />
                  <div className="flex justify-between text-[10px] text-[#A8B3C5] font-mono">
                    <span>{formatTime(currentTimeSec)}</span>
                    <span>{formatTime(durationSec)}</span>
                  </div>
                </div>

                {/* Player controls */}
                <div className="grid grid-cols-3 items-center">
                  
                  {/* Playback speed control */}
                  <div className="flex items-center gap-1 justify-start">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Speed:</span>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="bg-[#141A22] border border-[#2A3442] rounded px-1.5 py-0.5 text-[10px] text-white font-semibold focus:outline-none cursor-pointer"
                    >
                      {speedOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.toFixed(2)}x
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Main media buttons */}
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={handleSkipBackward}
                      className="p-1 text-slate-400 hover:text-white hover:bg-[#141A22] rounded transition-colors focus:outline-none"
                      aria-label="Skip backward 10 seconds"
                    >
                      <RotateCcw className="h-4.5 w-4.5" />
                    </button>

                    <button 
                      onClick={() => setIsPlaying(prev => !prev)}
                      className="h-10 w-10 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white flex items-center justify-center shadow-none transition-all focus:outline-none"
                      aria-label={isPlaying ? "Pause audio playback" : "Play audio playback"}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                    </button>

                    <button 
                      onClick={handleSkipForward}
                      className="p-1 text-slate-400 hover:text-white hover:bg-[#141A22] rounded transition-colors focus:outline-none"
                      aria-label="Skip forward 10 seconds"
                    >
                      <RotateCw className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Volume slider */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <Volume2 className="h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                      className="w-14 h-1 bg-[#2A3442] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                      aria-label="Volume level control slider"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons + metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2A3442] pt-4 text-xs text-[#A8B3C5]">
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Updated {displayDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    Track: {selectedLanguage}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  {/* Download button */}
                  <button
                    onClick={() => {
                      if (!playbook.audio_url) return;
                      window.open(playbook.audio_url, "_blank");
                    }}
                    className="flex h-8 items-center gap-1.5 px-3 rounded border border-[#2A3442] bg-[#0B0F14] hover:border-slate-500 hover:text-white text-[#F3F4F6] transition-all select-none"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {selectedLanguage.substring(0, 3)} MP3</span>
                  </button>

                  <button 
                    disabled
                    className="flex h-8 items-center gap-2 px-3 rounded border border-[#2A3442] bg-[#0B0F14]/40 text-slate-600 cursor-not-allowed select-none"
                    title="Bookmark works only when authenticated."
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Save</span>
                  </button>

                  <button 
                    onClick={handleShare}
                    className="flex h-8 w-8 items-center justify-center rounded border border-[#2A3442] bg-[#0B0F14] text-[#F3F4F6] hover:bg-[#141A22] hover:text-white transition-all"
                    aria-label="Copy page link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* RELATED AUDIO BRIEFINGS LIST */}
          {relatedPlaybooks.length > 0 && (
            <section className="mt-12 border-t border-[#2A3442] pt-8">
              <h2 className="text-base font-bold text-white mb-4 tracking-tight">
                Related Security Briefings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPlaybooks.map((p) => (
                  <Link
                    key={p.id}
                    href={`/playbooks/${p.slug}`}
                    className="flex items-center gap-4 p-3 rounded border border-[#2A3442] bg-[#141A22] hover:border-slate-500 transition-all group"
                  >
                    <div className="relative h-12 w-12 shrink-0 rounded border border-[#2A3442] bg-[#0B0F14] overflow-hidden select-none">
                      {p.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={p.cover_image} 
                          alt={p.title} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#A8B3C5]">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#3B82F6] transition-colors truncate">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[#A8B3C5] truncate mt-0.5">
                        {p.description}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-[#A8B3C5] group-hover:text-white transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Access Policy disclaimer */}
          <div className="mt-12 p-5 rounded border border-[#2A3442] bg-[#141A22]/40 flex gap-4 text-xs text-[#A8B3C5] leading-relaxed">
            <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#F3F4F6] block mb-1">Access Protocol</span>
              Audio briefings are served securely directly from our edge nodes. Sync preferences, offline playback buffers, and progress timelines require an active SecOps profile session.
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  );
}
