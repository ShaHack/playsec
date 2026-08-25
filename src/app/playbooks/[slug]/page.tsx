"use client";

import { useState, useEffect, use, useRef, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playbookService } from "@/services/playbookService";
import { AudioPlaybook } from "@/types/playbook";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { downloadFile } from "@/utils/download";
import { preloadAudioTrack, preloadPlaybookAudioTracks } from "@/utils/audioPreloader";
import { 
  Play, Pause, Volume2, Bookmark, Share2, 
  ChevronRight, Calendar, Globe, Loader2,
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
  
  const { isLoggedIn } = useAuth();
  const [toastMsg, setToastMsg] = useState("");
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingAction: any;
  }>({
    isOpen: false,
    title: "",
    message: "",
    pendingAction: null,
  });
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Tamil" | "Hindi">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("playsec_audio_lang");
      if (saved === "English" || saved === "Tamil" || saved === "Hindi") {
        return saved;
      }
    }
    return "English";
  });
  
  // Audio Player State & Version Refs
  type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(80);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingRef = useRef(false);
  const requestIdRef = useRef(0);

  // Derived active track URL based on selectedLanguage & playbook
  const availableLanguages = useMemo(() => {
    if (!playbook) return [];
    return playbook.languages && playbook.languages.length > 0
      ? playbook.languages
      : [
          {
            language: playbook.language || "English",
            audio_url: playbook.audio_url || "",
            download_url: playbook.audio_url || "",
            duration: playbook.duration || "08:15"
          }
        ];
  }, [playbook]);

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
      } catch (e: unknown) {
        setErrorMsg((e as Error).message || "Unable to connect to PlaySec servers.");
      } finally {
        setLoading(false);
      }
    }
    loadPlaybook();
  }, [slug]);

  // Immediately preload all audio language tracks in background upon loading playbook
  useEffect(() => {
    if (playbook) {
      preloadPlaybookAudioTracks(playbook.languages);
    }
  }, [playbook]);

  // Auto-resume pending action after authentication
  useEffect(() => {
    if (!isLoggedIn || !playbook) return;
    try {
      const saved = localStorage.getItem("playsec_pending_action");
      if (saved) {
        const action = JSON.parse(saved);
        if (action.type === "play" && action.slug === slug) {
          localStorage.removeItem("playsec_pending_action");
          wasPlayingRef.current = true;
          const timer = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().then(() => {
                setIsPlaying(true);
                setPlayerStatus("playing");
              }).catch(() => {});
            }
            setToastMsg("Welcome! Playback started automatically.");
            setTimeout(() => setToastMsg(""), 3500);
          }, 0);
          return () => clearTimeout(timer);
        } else if (action.type === "download" && action.url) {
          localStorage.removeItem("playsec_pending_action");
          downloadFile(action.url, `${playbook.title}_${selectedLanguage}`);
          const timer = setTimeout(() => {
            setToastMsg("Welcome! Download started automatically.");
            setTimeout(() => setToastMsg(""), 3500);
          }, 0);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // Silently ignore storage errors
    }
  }, [isLoggedIn, playbook, slug, selectedLanguage]);

  // Multilingual Language Switching Engine
  const handleLanguageChange = (lang: "English" | "Tamil" | "Hindi") => {
    if (lang === selectedLanguage) return;

    // 1. Capture whether current track was playing or intended to play
    const wasPlaying = isPlaying || playerStatus === "playing";
    wasPlayingRef.current = wasPlaying;

    // 2. Increment request ID to invalidate any stale async callbacks from previous tracks
    requestIdRef.current++;

    // 3. Immediately update selected language state and show feedback
    setSelectedLanguage(lang);
    localStorage.setItem("playsec_audio_lang", lang);
    setToastMsg(`Switched briefing audio to ${lang}`);
    setTimeout(() => setToastMsg(""), 3000);

    // 4. Synchronously reset player states (00:00, 0%, clear old duration, set loading)
    setPlayerStatus("loading");
    setIsPlaying(false);
    setCurrentTimeSec(0);
    setProgress(0);
    setDurationSec(0);

    // 5. Preload target language track
    const targetTrack = availableLanguages.find(
      (l) => l.language.toLowerCase() === lang.toLowerCase()
    );
    const newAudioUrl = targetTrack?.audio_url || playbook?.audio_url || "";
    if (newAudioUrl) {
      preloadAudioTrack(newAudioUrl, "auto");
    }

    // 6. Explicitly reset and reload underlying HTMLAudioElement synchronously
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // Ignore setting currentTime before source load
      }
      audio.src = newAudioUrl;
      audio.load();
    }
  };

  // Dedicated Play/Pause Toggle Handler
  const togglePlayPause = () => {
    if (!isLoggedIn) {
      setAuthModal({
        isOpen: true,
        title: "Sign in required to play audio",
        message: "Please sign in with Google to stream full Audio Playbooks and sync your playback progress.",
        pendingAction: { type: "play", slug },
      });
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying || playerStatus === "playing") {
      audio.pause();
      setIsPlaying(false);
      setPlayerStatus("paused");
      wasPlayingRef.current = false;
    } else {
      if (playerStatus === "ended" || progress >= 100) {
        audio.currentTime = 0;
        setCurrentTimeSec(0);
        setProgress(0);
      }

      audio.play().then(() => {
        setIsPlaying(true);
        setPlayerStatus("playing");
        wasPlayingRef.current = true;
      }).catch(() => {
        setIsPlaying(false);
        setPlayerStatus("paused");
        wasPlayingRef.current = false;
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Handle play/pause commands on audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle speed rate commands on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle volume rate commands on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(durationSec, audioRef.current.currentTime + 10);
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current && durationSec) {
      audioRef.current.currentTime = (val / 100) * durationSec;
    }
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
        <Navbar />
        <main className="min-h-screen bg-[#F5F8FA] flex items-center justify-center text-[#60717D]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4FAFC1] mx-auto mb-4" />
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
        <Navbar />
        <main className="min-h-screen bg-[#F5F8FA] flex items-center justify-center text-[#C95757] p-6">
          <div className="text-center max-w-md bg-white border border-[#D9E4EA] p-6 rounded">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Operational Failure</h2>
            <p className="text-xs text-[#60717D] leading-relaxed">{errorMsg}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!playbook) {
    notFound();
  }

  const displayDate = playbook.updated_date
    ? new Date(playbook.updated_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Recently Updated";

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-[#F5F8FA] text-[#17232D] py-10 relative overflow-hidden select-text">
        
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.4,
            backgroundImage: "linear-gradient(#D9E4EA 1px, transparent 1px), linear-gradient(90deg, #D9E4EA 1px, transparent 1px)",
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
                className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-white border border-[#D9E4EA] text-[#17232D] px-4 py-2.5 rounded shadow-md text-xs font-semibold select-none"
              >
                <Check className="h-4 w-4 text-[#3D8B72]" />
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button link */}
          <div className="mb-4">
            <Link 
              href="/playbooks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#60717D] hover:text-[#17232D] transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Security Briefings
            </Link>
          </div>

          {/* ── AUDIO LANGUAGE SELECTOR BAR ── */}
          {(() => {
            const availableLanguages = playbook.languages && playbook.languages.length > 0
              ? playbook.languages
              : [
                  {
                    language: playbook.language || "English",
                    audio_url: playbook.audio_url || "",
                    download_url: playbook.audio_url || "",
                    duration: playbook.duration || "08:15"
                  }
                ];

            return (
              <div className="mb-4 flex items-center justify-between border border-[#D9E4EA] bg-white px-4 py-2.5 rounded shadow-xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#4FAFC1]" />
                  <span className="text-xs font-bold text-[#17232D] uppercase tracking-wider">Audio Language</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["English", "Tamil", "Hindi"] as const).map((lang) => {
                    const track = availableLanguages.find(
                      (l) => l.language.toLowerCase() === lang.toLowerCase()
                    );
                    const isAvailable = Boolean(track && track.audio_url);
                    const isSelected = selectedLanguage.toLowerCase() === lang.toLowerCase();

                    return (
                      <button
                        key={lang}
                        disabled={!isAvailable}
                        aria-pressed={isSelected}
                        aria-label={!isAvailable ? `${lang} audio briefing unavailable` : `Switch audio briefing language to ${lang}`}
                        onClick={() => {
                          if (isAvailable) {
                            handleLanguageChange(lang);
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all select-none focus:outline-none focus:ring-2 focus:ring-[#4FAFC1] ${
                          !isAvailable
                            ? "bg-[#F5F8FA] border border-[#D9E4EA] text-[#8193A0] cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-[#173B57] text-white shadow-xs cursor-pointer"
                            : "bg-white border border-[#D9E4EA] text-[#60717D] hover:text-[#17232D] hover:bg-[#F5F8FA] cursor-pointer"
                        }`}
                        title={!isAvailable ? `${lang} track unavailable for this playbook` : `Switch to ${lang}`}
                      >
                        {lang} {!isAvailable && "(N/A)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* SPOTIFY-STYLE AUDIO BOARD */}
          <section className="rounded border border-[#D9E4EA] bg-white p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-xs">
            {/* Playbook Cover Art */}
            <div className="relative h-44 w-44 shrink-0 rounded border border-[#D9E4EA] bg-[#F5F8FA] overflow-hidden select-none flex items-center justify-center">
              {playbook.cover_image ? (
                <>
                  <Image 
                    src={playbook.cover_image} 
                    alt={playbook.title} 
                    fill
                    sizes="176px"
                    className="object-contain object-center relative z-10 p-1.5"
                    unoptimized
                    priority
                  />
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#60717D]">
                  <BookOpen className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Audio Details & Controls column */}
            <div className="flex-1 flex flex-col w-full text-center md:text-left">
              
              {/* Trust Tag Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2.5 text-[9px] font-bold uppercase tracking-wider text-[#60717D]">
                <span className="flex items-center gap-1 text-[#3D8B72] bg-[#E8F4F0] px-2 py-0.5 rounded border border-[#C4E4D9]">
                  <CheckCircle2 className="h-3 w-3" />
                  Security Reviewed
                </span>
                <span className="bg-[#F5F8FA] px-2 py-0.5 rounded border border-[#D9E4EA]">
                  v1.2 (Latest)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#17232D] tracking-tight leading-tight mb-2">
                {playbook.title}
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed text-[#60717D] mb-4">
                {playbook.description}
              </p>

              {/* Central Audio Player Console */}
              {(() => {
                const availableLanguages = playbook.languages && playbook.languages.length > 0
                  ? playbook.languages
                  : [
                      {
                        language: playbook.language || "English",
                        audio_url: playbook.audio_url || "",
                        download_url: playbook.audio_url || "",
                        duration: playbook.duration || "08:15"
                      }
                    ];
                const currentTrack = availableLanguages.find(
                  (l) => l.language.toLowerCase() === selectedLanguage.toLowerCase()
                ) || availableLanguages[0];
                
                const activeAudioUrl = currentTrack?.audio_url || playbook.audio_url || "";

                return (
                  <div className="bg-[#F5F8FA] border border-[#D9E4EA] rounded p-4 mb-4 select-none">
                    
                    {/* Audio Seek bar */}
                    <audio 
                      ref={audioRef}
                      src={activeAudioUrl} 
                      preload="auto"
                      crossOrigin="anonymous"
                      onTimeUpdate={() => {
                        if (!audioRef.current || playerStatus === "loading") return;
                        const cur = audioRef.current.currentTime;
                        const dur = audioRef.current.duration || durationSec || 1;
                        setCurrentTimeSec(Math.floor(cur));
                        if (dur > 0) {
                          setProgress(Math.min(100, (cur / dur) * 100));
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (!audioRef.current) return;
                        const dur = audioRef.current.duration;
                        if (dur && !isNaN(dur) && dur > 0) {
                          setDurationSec(Math.floor(dur));
                        }
                      }}
                      onCanPlay={() => {
                        if (!audioRef.current) return;
                        if (wasPlayingRef.current) {
                          audioRef.current.play().then(() => {
                            setIsPlaying(true);
                            setPlayerStatus("playing");
                          }).catch(() => {
                            setIsPlaying(false);
                            setPlayerStatus("paused");
                            wasPlayingRef.current = false;
                          });
                        } else {
                          setIsPlaying(false);
                          setPlayerStatus("paused");
                        }
                      }}
                      onEnded={() => {
                        setIsPlaying(false);
                        setPlayerStatus("ended");
                        wasPlayingRef.current = false;
                        setProgress(100);
                        if (audioRef.current && audioRef.current.duration) {
                          setCurrentTimeSec(Math.floor(audioRef.current.duration));
                        }
                      }}
                      onError={() => {
                        setIsPlaying(false);
                        setPlayerStatus("error");
                        wasPlayingRef.current = false;
                      }}
                    />
                    
                    <div className="space-y-1 mb-3">
                      <input 
                        type="range" 
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-1 bg-[#D9E4EA] rounded-lg appearance-none cursor-pointer accent-[#4FAFC1]"
                        aria-label="Audio progress slider"
                      />
                      <div className="flex justify-between text-[10px] text-[#60717D] font-mono">
                        <span>{formatTime(currentTimeSec)}</span>
                        <span>{playerStatus === "loading" ? "Loading..." : formatTime(durationSec)}</span>
                      </div>
                    </div>

                    {/* Player controls */}
                    <div className="grid grid-cols-3 items-center">
                      
                      {/* Playback speed control */}
                      <div className="flex items-center gap-1 justify-start">
                        <span className="text-[8px] font-bold text-[#60717D] uppercase tracking-wider">Speed:</span>
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                          className="bg-white border border-[#D9E4EA] rounded px-1.5 py-0.5 text-[10px] text-[#17232D] font-semibold focus:outline-none cursor-pointer"
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
                          className="p-1 text-[#60717D] hover:text-[#17232D] hover:bg-white rounded transition-colors focus:outline-none"
                          aria-label="Skip backward 10 seconds"
                        >
                          <RotateCcw className="h-4.5 w-4.5" />
                        </button>

                        <button 
                          onClick={togglePlayPause}
                          disabled={playerStatus === "loading"}
                          className="h-10 w-10 rounded-full bg-[#173B57] hover:bg-[#245A7A] disabled:opacity-70 text-white flex items-center justify-center shadow-xs transition-all focus:outline-none cursor-pointer"
                          aria-label={playerStatus === "playing" || isPlaying ? "Pause audio playback" : "Play audio playback"}
                        >
                          {playerStatus === "loading" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          ) : playerStatus === "playing" || isPlaying ? (
                            <Pause className="h-4 w-4 fill-white" />
                          ) : (
                            <Play className="h-4 w-4 fill-white ml-0.5" />
                          )}
                        </button>

                        <button 
                          onClick={handleSkipForward}
                          className="p-1 text-[#60717D] hover:text-[#17232D] hover:bg-white rounded transition-colors focus:outline-none"
                          aria-label="Skip forward 10 seconds"
                        >
                          <RotateCw className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      {/* Volume slider */}
                      <div className="flex items-center gap-1.5 justify-end">
                        <Volume2 className="h-3.5 w-3.5 text-[#60717D]" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                          className="w-14 h-1 bg-[#D9E4EA] rounded-lg appearance-none cursor-pointer accent-[#4FAFC1]"
                          aria-label="Volume level control slider"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action buttons + metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D9E4EA] pt-4 text-xs text-[#60717D]">
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
                      const availableLanguages = playbook.languages && playbook.languages.length > 0
                        ? playbook.languages
                        : [
                            {
                              language: playbook.language || "English",
                              audio_url: playbook.audio_url || "",
                              download_url: playbook.audio_url || ""
                            }
                          ];
                      const currentTrack = availableLanguages.find(
                        (l) => l.language.toLowerCase() === selectedLanguage.toLowerCase()
                      ) || availableLanguages[0];
                      const downloadUrl = currentTrack?.download_url || currentTrack?.audio_url || playbook.audio_url;

                      if (!downloadUrl) return;

                      if (!isLoggedIn) {
                        setAuthModal({
                          isOpen: true,
                          title: "Sign in required to download file",
                          message: "Please sign in with Google to download Audio Playbooks and security resources.",
                          pendingAction: { type: "download", url: downloadUrl, slug },
                        });
                        return;
                      }

                      downloadFile(downloadUrl, `${playbook.title}_${selectedLanguage}`);
                    }}
                    className="flex h-8 items-center gap-1.5 px-3 rounded border border-[#D9E4EA] bg-white hover:bg-[#F5F8FA] text-[#17232D] font-bold text-xs transition-all select-none cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {selectedLanguage} MP3</span>
                  </button>

                  <button 
                    disabled
                    className="flex h-8 items-center gap-2 px-3 rounded border border-[#D9E4EA] bg-[#F5F8FA] text-[#8193A0] cursor-not-allowed select-none"
                    title="Bookmark works only when authenticated."
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Save</span>
                  </button>

                  <button 
                    onClick={handleShare}
                    className="flex h-8 w-8 items-center justify-center rounded border border-[#D9E4EA] bg-white text-[#17232D] hover:bg-[#F5F8FA] transition-all"
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
            <section className="mt-12 border-t border-[#D9E4EA] pt-8">
              <h2 className="text-base font-bold text-[#17232D] mb-4 tracking-tight">
                Related Security Briefings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPlaybooks.map((p) => (
                  <Link
                    key={p.id}
                    href={`/playbooks/${p.slug}`}
                    className="flex items-center gap-4 p-3 rounded border border-[#D9E4EA] bg-white hover:border-[#4FAFC1] transition-all group shadow-xs"
                  >
                    <div className="relative h-12 w-12 shrink-0 rounded border border-[#D9E4EA] bg-[#F5F8FA] overflow-hidden select-none">
                      {p.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={p.cover_image} 
                          alt={p.title} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#60717D]">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#17232D] group-hover:text-[#4FAFC1] transition-colors truncate">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[#60717D] truncate mt-0.5">
                        {p.description}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-[#60717D] group-hover:text-[#17232D] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Access Policy disclaimer */}
          <div className="mt-12 p-5 rounded border border-[#D9E4EA] bg-white flex gap-4 text-xs text-[#60717D] leading-relaxed shadow-xs">
            <Info className="h-5 w-5 text-[#4FAFC1] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#17232D] block mb-1">Access Protocol</span>
              Audio briefings are served securely directly from our edge nodes. Sync preferences, offline playback buffers, and progress timelines require an active SecOps profile session.
            </div>
          </div>

        </div>
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal((p) => ({ ...p, isOpen: false }))}
        title={authModal.title}
        message={authModal.message}
        pendingAction={authModal.pendingAction}
      />
      
      <Footer />
    </>
  );
}
