"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPage() {

  const policySections = [
    {
      title: "Information We Collect",
      items: [
        { label: "Account Information", desc: "Usernames, verified email addresses, profile selections, and credential records required to access authenticated features." },
        { label: "Cookies", desc: "Technical session identifiers stored locally to preserve system configuration preferences (such as audio language or player speed)." },
        { label: "Analytics", desc: "Aggregated, non-identifiable telemetry reporting briefing loads, search patterns, and bandwidth metrics to evaluate platform capacity." },
      ],
    },
    {
      title: "How Data Is Used & Protected",
      items: [
        { label: "Usage Policy", desc: "Your contact details are processed strictly to handle support inquiries, technical audits, and incident notice notifications. No personal data is sold or shared." },
        { label: "Data Protection", desc: "Security controls (including encryption in transit via TLS and encryption at rest) are maintained to secure communications and credential records." },
        { label: "Third-party Services", desc: "PlaySec utilizes CDNs and asset networks to distribute media briefings. These services process connection telemetry strictly to optimize packet deliveries." },
      ],
    },
    {
      title: "Your Rights & Contact",
      items: [
        { label: "User Rights", desc: "You maintain the right to review, update, or request deletion of account records. Send request forms to the privacy coordinator." },
        { label: "Contact Regarding Privacy", desc: "For security audit reports or privacy inquiries, contact the PlaySec Support Team directly at playsec.platform@gmail.com." },
      ],
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded">
                <Lock className="h-3 w-3" />
                Privacy Policy
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded">
                <CheckCircle className="h-3 w-3" />
                Last Updated: July 22, 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A1A1AA] max-w-2xl mx-auto">
              Your privacy matters. Learn how PlaySec collects, stores, and protects information.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 mx-auto max-w-[960px] px-6 space-y-10">
          {policySections.map((group, groupIdx) => (
            <div key={groupIdx} className="rounded border border-[#27272A] bg-[#18181B] p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#27272A] pb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2563EB]" />
                {group.title}
              </h2>
              
              <div className="space-y-4">
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-200">{item.label}</h3>
                    <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

      </main>

      <Footer />
    </>
  );
}
