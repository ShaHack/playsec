"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface PlaySecLogoProps {
  className?: string;
  size?: number;
  isPlaying?: boolean;
  showText?: boolean;
}

export default function PlaySecLogo({
  className = "",
  size = 32,
  isPlaying = false,
  showText = true,
}: PlaySecLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 11 Symmetrical Bar Heights & y-center Offset Animation (Expands Upward & Downward)
  const getBarAnimation = (index: number) => {
    const distFromCenter = Math.abs(index - 5);
    const centerPeak = 32 - distFromCenter * 5.2; // 32, 26.8, 21.6, 16.4, 11.2, 6
    const minH = Math.max(5, centerPeak * 0.55);
    const maxH = Math.min(34, centerPeak * 1.2);

    let hArray: number[];

    if (isPlaying) {
      hArray = [minH, maxH * 0.7, centerPeak, maxH];
    } else if (isHovered) {
      hArray = [minH * 1.1, maxH * 1.1, minH * 1.1];
    } else {
      hArray = [minH, maxH, minH];
    }

    // Recalculate y = 18 - h/2 for every frame height to ensure PERFECT top & bottom symmetry from center y=18
    const yArray = hArray.map((h) => 18 - h / 2);

    return {
      height: hArray,
      y: yArray,
      transition: {
        duration: isPlaying ? 0.65 + (index % 5) * 0.1 : isHovered ? 0.85 + (index % 4) * 0.12 : 1.9 + (index % 6) * 0.2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      },
    };
  };

  // 11 Symmetrical Bars x positions (width=3px)
  const barPositions = [
    16, 21.5, 27, 32.5, 38, 43.5, 49, 54.5, 60, 65.5, 71
  ];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── DUAL-EXPANDING SYMMETRICAL AUDIO WAVEFORM SVG (CENTER AXIS Y=18) ── */}
      <svg
        width={Math.round(size * 2.3)}
        height={size}
        viewBox="0 0 88 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Cisco Blue (#0A84FF) -> Azure Blue (#38BDF8) -> Cyan (#22D3EE) */}
          <linearGradient id="ps-wave-gradient" x1="0" y1="0" x2="88" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A84FF" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          {/* Soft Ambient Blue Glow Filter */}
          <filter id="ps-blue-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.039  0 0 0 0 0.518  0 0 0 0 1  0 0 0 0.4 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#ps-blue-glow)">
          {/* Center Horizontal Reference Axis Line (Subtle background signal path) */}
          <line x1="4" y1="18" x2="84" y2="18" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="2 2" />

          {/* Left AI Network Node & Connection Line */}
          <line x1="6" y1="18" x2="16" y2="18" stroke="#0A84FF" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="1.5 1.5" />
          <circle cx="6" cy="18" r="2.2" fill="#0A84FF" />

          {/* Right AI Network Node & Connection Line */}
          <line x1="71" y1="18" x2="81" y2="18" stroke="#22D3EE" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="1.5 1.5" />
          <circle cx="81" cy="18" r="2.2" fill="#22D3EE" />

          {/* 11 Symmetrical Vertical Equalizer Bars (Expanding both UP and DOWN from y=18) */}
          {barPositions.map((xPos, i) => (
            <motion.rect
              key={i}
              x={xPos}
              width={3}
              rx={1.5}
              fill="url(#ps-wave-gradient)"
              animate={getBarAnimation(i)}
            />
          ))}
        </g>
      </svg>

      {/* ── UNCHANGED BRAND TYPOGRAPHY: PLAYSEC ── */}
      {showText && (
        <span className="text-[18px] font-black tracking-[0.03em] text-white flex items-center font-sans">
          PLAY
          <span className="bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#0A84FF] bg-clip-text text-transparent ml-[1px]">
            SEC
          </span>
        </span>
      )}
    </div>
  );
}
