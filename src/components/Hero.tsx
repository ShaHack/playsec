"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Activity, Zap, ShieldAlert } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AttackLog { id: string; time: string; type: string; route: string; }
interface Particle  { id: number; left: number; top: number; size: number; dur: number; delay: number; anim: "A"|"B"|"C"|"D"; }
interface NetLine   { id: number; x1: number; y1: number; x2: number; y2: number; dur: number; delay: number; }
type ThreatLevel    = "HIGH"|"MEDIUM"|"CRITICAL";

interface HeroState {
  ready:        boolean;
  attacksToday: number;
  streams:      number;
  countries:    number;
  topCountry:   string;
  threatLevel:  ThreatLevel;
  logs:         AttackLog[];
  particles:    Particle[];
  netLines:     NetLine[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const TOP_COUNTRIES = [
  "United States","China","Russia","India",
  "Germany","Brazil","United Kingdom","Singapore",
];
const FEED_COUNTRIES = [
  "India","Russia","China","United States","Germany","Brazil",
  "United Kingdom","Singapore","Japan","France","Canada","Australia",
  "Iran","Netherlands","South Korea","Ukraine",
];
const ATTACK_TYPES = [
  "SQL Injection","Credential Stuffing","DDoS Attack","Malware Beacon",
  "APT Activity","Port Scan","Phishing Campaign","Ransomware Delivery",
  "Zero-Day Exploit","Data Exfiltration","Brute Force","Command Injection",
];
const THREAT_STYLE: Record<ThreatLevel,{ text: string }> = {
  HIGH:     { text: "text-orange-400" },
  MEDIUM:   { text: "text-yellow-400" },
  CRITICAL: { text: "text-red-400"    },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const ri = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function lsGetOrInit(key: string, min: number, max: number): number {
  const stored = localStorage.getItem(key);
  if (stored !== null) return parseInt(stored, 10);
  const val = ri(min, max);
  localStorage.setItem(key, String(val));
  return val;
}

function pickThreatLevel(): ThreatLevel {
  const n = Math.random() * 100;
  if (n < 2)  return "CRITICAL";
  if (n < 10) return "MEDIUM";
  return "HIGH";
}

function makeLogEntry(id: number): AttackLog {
  const src = FEED_COUNTRIES[ri(0, FEED_COUNTRIES.length - 1)];
  let dst: string;
  do { dst = FEED_COUNTRIES[ri(0, FEED_COUNTRIES.length - 1)]; } while (dst === src);
  return {
    id:    `l${id}`,
    time:  new Date().toTimeString().slice(0, 5),
    type:  ATTACK_TYPES[ri(0, ATTACK_TYPES.length - 1)],
    route: `${src} → ${dst}`,
  };
}

const INITIAL_STATE: HeroState = {
  ready: false, attacksToday: 0, streams: 0, countries: 0,
  topCountry: "United States", threatLevel: "HIGH", logs: [], particles: [], netLines: [],
};

export default function Hero() {
  const [state, setState] = useState<HeroState>(INITIAL_STATE);

  const logId     = useRef(0);
  const atkTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doTick    = useRef<() => void>(() => undefined);
  const doFeed    = useRef<() => void>(() => undefined);
  const doRotate  = useRef<() => void>(() => undefined);

  useEffect(() => {
    const atk = lsGetOrInit("ps_atk_count", 1_200_000, 2_500_000);
    const str = lsGetOrInit("ps_streams",   500,       1_200);
    const ctr = lsGetOrInit("ps_countries", 140,       200);

    const ANIMS = ["A","B","C","D"] as const;
    const seed: AttackLog[] = Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() - (5 - i) * ri(12, 40));
      const src = FEED_COUNTRIES[ri(0, FEED_COUNTRIES.length - 1)];
      let dst: string;
      do { dst = FEED_COUNTRIES[ri(0, FEED_COUNTRIES.length - 1)]; } while (dst === src);
      return {
        id: `l${logId.current++}`,
        time: d.toTimeString().slice(0, 5),
        type: ATTACK_TYPES[ri(0, ATTACK_TYPES.length - 1)],
        route: `${src} → ${dst}`,
      };
    });

    setState({
      ready:        true,
      attacksToday: atk,
      streams:      str,
      countries:    ctr,
      topCountry:   TOP_COUNTRIES[ri(0, TOP_COUNTRIES.length - 1)],
      threatLevel:  pickThreatLevel(),
      logs:         seed,
      particles: Array.from({ length: 15 }, (_, i) => ({
        id: i, left: ri(5, 95), top: ri(5, 95),
        size: ri(1, 2), dur: ri(35, 60), delay: ri(0, 30),
        anim: ANIMS[ri(0, 3)],
      })),
      netLines: Array.from({ length: 6 }, (_, i) => ({
        id: i, x1: ri(10, 90), y1: ri(10, 90),
        x2: ri(10, 90), y2: ri(10, 90),
        dur: ri(12, 24), delay: ri(0, 10),
      })),
    });
  }, []);

  useEffect(() => {
    if (!state.ready) return;

    doTick.current = () => {
      setState(prev => {
        const next = prev.attacksToday + ri(2, 25);
        localStorage.setItem("ps_atk_count", String(next));
        return { ...prev, attacksToday: next };
      });
      atkTimer.current = setTimeout(() => doTick.current(), ri(1_000, 3_000));
    };

    doFeed.current = () => {
      const entry = makeLogEntry(logId.current++);
      setState(prev => ({ ...prev, logs: [entry, ...prev.logs.slice(0, 4)] }));
      feedTimer.current = setTimeout(() => doFeed.current(), ri(2_000, 4_000));
    };

    doRotate.current = () => {
      setState(prev => ({ ...prev, topCountry: TOP_COUNTRIES[ri(0, TOP_COUNTRIES.length - 1)] }));
      topTimer.current = setTimeout(() => doRotate.current(), ri(30_000, 60_000));
    };

    atkTimer.current  = setTimeout(() => doTick.current(),   ri(1_000,  3_000));
    feedTimer.current = setTimeout(() => doFeed.current(),   ri(2_000,  4_000));
    topTimer.current  = setTimeout(() => doRotate.current(), ri(30_000, 60_000));

    const streamInt = setInterval(() => {
      setState(prev => {
        const delta = ri(1, 5) * (Math.random() > 0.5 ? 1 : -1);
        const next  = Math.max(500, Math.min(1_200, prev.streams + delta));
        localStorage.setItem("ps_streams", String(next));
        return { ...prev, streams: next };
      });
    }, ri(3_000, 6_000));

    const ctrInt = setInterval(() => {
      setState(prev => {
        const delta = ri(0, 2) * (Math.random() > 0.5 ? 1 : -1);
        return { ...prev, countries: Math.max(140, Math.min(200, prev.countries + delta)) };
      });
    }, ri(15_000, 30_000));

    return () => {
      if (atkTimer.current)  clearTimeout(atkTimer.current);
      if (feedTimer.current) clearTimeout(feedTimer.current);
      if (topTimer.current)  clearTimeout(topTimer.current);
      clearInterval(streamInt);
      clearInterval(ctrInt);
    };
  }, [state.ready]);

  const { ready, attacksToday, streams, countries, topCountry, threatLevel, logs, particles, netLines } = state;

  return (
    <section className="relative w-full min-h-[85vh] flex items-center border-b border-[#27272A] py-12 md:py-16 select-text bg-[#09090B]">
      <style>{`
        @keyframes floatA{0%{transform:translate(0,0)}100%{transform:translate(10px,-10px)}}
        @keyframes floatB{0%{transform:translate(0,0)}100%{transform:translate(-10px,10px)}}
        @keyframes floatC{0%{transform:translate(0,0)}100%{transform:translate(12px,8px)}}
        @keyframes floatD{0%{transform:translate(0,0)}100%{transform:translate(-8px,-12px)}}
        @keyframes lineFade{0%,100%{opacity:0}50%{opacity:0.4}}
      `}</style>

      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: 0.015,
          backgroundImage:"linear-gradient(#27272A 1px,transparent 1px),linear-gradient(90deg,#27272A 1px,transparent 1px)",
          backgroundSize:"56px 56px",
        }} />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id}
          className="pointer-events-none absolute rounded-full bg-slate-700/20 z-0"
          style={{
            left:`${p.left}%`, top:`${p.top}%`,
            width:`${p.size}px`, height:`${p.size}px`,
            animation:`float${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* Network lines */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full z-0" preserveAspectRatio="none">
        {netLines.map(l => (
          <line key={l.id}
            x1={`${l.x1}%`} y1={`${l.y1}%`}
            x2={`${l.x2}%`} y2={`${l.y2}%`}
            stroke="rgba(161,161,170,0.06)" strokeWidth="1"
            style={{animation:`lineFade ${l.dur}s ease-in-out ${l.delay}s infinite`}}
          />
        ))}
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* LEFT: Headline / CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-tight">
            Structured Cybersecurity Playbooks{" "}
            <span className="text-[#2563EB]">For Security Practitioners</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#A1A1AA] max-w-lg">
            Accelerate your security expertise with interactive runbooks and
            structured career pathways designed by industry practitioners.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/playbooks"
              className="group flex h-10 items-center gap-2 rounded bg-[#2563EB] px-5 text-xs font-bold text-white transition-all hover:bg-blue-600 active:scale-[0.98] select-none shadow-none">
              Explore Playbooks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 stroke-[2]" />
            </Link>
            <a href="#why-playsec"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("why-playsec")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex h-10 items-center justify-center gap-2 rounded border border-[#27272A] bg-[#18181B] px-5 text-xs font-bold text-[#FAFAFA] transition-all hover:bg-[#27272A] active:scale-[0.98] select-none">
              Why PlaySec
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-[#27272A] grid grid-cols-2 gap-y-2.5 gap-x-6 max-w-md">
            {["Editorially reviewed","Updated regularly","Practical playbooks","Community verified"].map(label => (
              <div key={label} className="flex items-center gap-2.5 text-xs text-[#A1A1AA]">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#18181B] text-[#2563EB] border border-[#27272A]">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Threat Intelligence Dashboard (No Neon, No Glows) */}
        <div className="lg:col-span-6">
          <div className="rounded border border-[#27272A] bg-[#18181B] p-5 shadow-sm">
            {/* Panel header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                Threat Intelligence Center
              </span>
              <span className="flex items-center gap-1.5 text-[9px] text-[#EF4444] font-bold tracking-wider uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                Live Feed
              </span>
            </div>

            {/* Two equal-height cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Card A – Summary */}
              <div className="rounded border border-[#27272A] bg-[#09090B] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <Activity className="h-3.5 w-3.5 text-[#2563EB]" />
                  Overview Stats
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Attacks Logged</span>
                  <motion.span
                    key={attacksToday}
                    className="text-lg font-bold text-white tabular-nums block"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    {ready ? attacksToday.toLocaleString() : "—"}
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#27272A]">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Active Briefs</span>
                    <motion.span key={streams} className="text-xs font-bold text-[#2563EB]"
                      initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                      {ready ? streams.toLocaleString() : "—"}
                    </motion.span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Scope</span>
                    <motion.span key={countries} className="text-xs font-bold text-white"
                      initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                      {ready ? `${countries} Regions` : "—"}
                    </motion.span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272A]">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Active Target</span>
                  <AnimatePresence mode="wait">
                    <motion.span key={topCountry}
                      className="text-[10px] font-semibold text-slate-300 block"
                      initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.4 }}>
                      {topCountry}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Card B – Live Feed */}
              <div className="rounded border border-[#27272A] bg-[#09090B] p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#27272A]/40">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-orange-400" />
                    Live Activity
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 overflow-hidden max-h-[160px]">
                  <AnimatePresence initial={false}>
                    {logs.map(log => (
                      <motion.div key={log.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-2 py-1 rounded border border-[#27272A] bg-[#18181B] flex flex-col gap-0.5 shrink-0"
                      >
                        <div className="flex justify-between items-center gap-1">
                          <span className="text-[8px] text-slate-500 font-mono shrink-0">{log.time}</span>
                          <span className="text-[9px] text-[#FAFAFA] font-bold truncate">{log.type}</span>
                        </div>
                        <span className="text-[8px] text-[#2563EB] font-medium truncate">{log.route}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
