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

  const getBarAnimation = (index: number) => {
    const distFromCenter = Math.abs(index - 5);
    const centerPeak = 32 - distFromCenter * 5.2;
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

  const barPositions = [
    16, 21.5, 27, 32.5, 38, 43.5, 49, 54.5, 60, 65.5, 71
  ];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <linearGradient id="ps-wave-gradient" x1="0" y1="0" x2="88" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#173B57" />
            <stop offset="50%" stopColor="#245A7A" />
            <stop offset="100%" stopColor="#4FAFC1" />
          </linearGradient>
        </defs>

        <g>
          <line x1="4" y1="18" x2="84" y2="18" stroke="#4FAFC1" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="2 2" />

          <line x1="6" y1="18" x2="16" y2="18" stroke="#173B57" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="1.5 1.5" />
          <circle cx="6" cy="18" r="2.2" fill="#173B57" />

          <line x1="71" y1="18" x2="81" y2="18" stroke="#4FAFC1" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="1.5 1.5" />
          <circle cx="81" cy="18" r="2.2" fill="#4FAFC1" />

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

      {showText && (
        <span className="text-[18px] font-black tracking-[0.03em] text-[#17232D] flex items-center font-sans">
          PLAY
          <span className="text-[#4FAFC1] ml-[1px]">
            SEC
          </span>
        </span>
      )}
    </div>
  );
}
