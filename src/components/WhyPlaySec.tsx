"use client";

import { BookOpen, Terminal, CheckCircle } from "lucide-react";

export default function WhyPlaySec() {
  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Learn cybersecurity through organized, expert-curated playbooks instead of scattered tutorials."
    },
    {
      icon: Terminal,
      title: "Practical Playbooks",
      description: "Follow real-world procedures, investigation workflows, and defensive techniques used by security professionals."
    },
    {
      icon: CheckCircle,
      title: "Editorial Review",
      description: "Every playbook is reviewed and updated by experienced cybersecurity practitioners for technical accuracy."
    }
  ];

  return (
    <section id="why-playsec" className="py-12 bg-[#18181B] border-b border-[#27272A]">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left select-text">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex flex-col items-center md:items-start gap-3">
                
                <div className="flex h-10 w-10 items-center justify-center rounded bg-[#27272A] text-[#2563EB]">
                  <Icon className="h-5 w-5 stroke-[2]" />
                </div>
                
                <h3 className="text-base font-bold text-white tracking-tight">
                  {feature.title}
                </h3>
                
                <p className="text-xs sm:text-sm leading-relaxed text-[#A1A1AA]">
                  {feature.description}
                </p>
                
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
