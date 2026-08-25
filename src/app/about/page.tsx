"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Target, Compass, Award, Users, Eye, Layers } from "lucide-react";

export default function AboutPage() {

  return (
    <>
      <Navbar />

      <main className="flex-1 select-text bg-[#F5F8FA] text-[#17232D] min-h-screen">
        
        {/* Hero Section */}
        <section className="relative w-full border-b border-[#D9E4EA] py-16 bg-white">
          <div className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0.4,
              backgroundImage: "linear-gradient(#D9E4EA 1px, transparent 1px), linear-gradient(90deg, #D9E4EA 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          <div className="relative z-10 mx-auto max-w-[960px] px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B57] bg-[#E9F1F5] border border-[#D9E4EA] px-3 py-1 rounded mb-6">
              About PlaySec
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17232D] leading-tight">
              About PlaySec
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#60717D] max-w-2xl mx-auto">
              PlaySec is a cybersecurity learning platform focused on structured audio playbooks, organized technical resources, and practical learning for students and security professionals.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 mx-auto max-w-[1380px] px-6 lg:px-10 space-y-12">
          
          {/* Mission */}
          <div className="rounded border border-[#D9E4EA] bg-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#F5F8FA] border border-[#D9E4EA] text-[#173B57]">
                <Target className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-[#17232D] uppercase tracking-wider">Our Mission</h2>
            </div>
            <p className="text-sm text-[#60717D] leading-relaxed">
              PlaySec was founded with the mission to bridge the gap between academic theory and the daily realities of security engineering. Traditional training relies heavily on long video tutorials and surface-level demonstrations. PlaySec delivers concentrated, incident-driven technical blueprints designed to help security teams, analysts, and students build immediate capability and practical diagnostic instincts.
            </p>
          </div>

          {/* What PlaySec Offers */}
          <div>
            <h3 className="text-base font-bold text-[#17232D] uppercase tracking-wider mb-6">What PlaySec Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Compass className="h-5 w-5 text-[#4FAFC1]" />,
                  title: "Structured Audio Playbooks",
                  desc: "Incident-focused audio sessions walking through threat patterns, mitigation steps, and deployment diagnostics.",
                },
                {
                  icon: <Shield className="h-5 w-5 text-[#4FAFC1]" />,
                  title: "Knowledge Library",
                  desc: "Comprehensive guidelines, reference designs, and configuration blueprints for common attack landscapes.",
                },
                {
                  icon: <Layers className="h-5 w-5 text-[#4FAFC1]" />,
                  title: "Career Learning Paths",
                  desc: "Structured roadmaps tailored to develop fundamental, operational, and incident response expertise.",
                },
                {
                  icon: <Award className="h-5 w-5 text-[#4FAFC1]" />,
                  title: "Practical Security Resources",
                  desc: "Technical files, log samples, and code blueprints audited by senior security operations practitioners.",
                },
                {
                  icon: <Users className="h-5 w-5 text-[#4FAFC1]" />,
                  title: "Community",
                  desc: "A centralized platform to report telemetry issues, discuss mitigation vectors, and receive direct team reviews.",
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded border border-[#D9E4EA] bg-white p-5 shadow-xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[#F5F8FA] border border-[#D9E4EA] text-[#173B57] mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-[#17232D] mb-2">{item.title}</h4>
                  <p className="text-xs text-[#60717D] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why PlaySec */}
          <div className="rounded border border-[#D9E4EA] bg-white p-6 md:p-8 shadow-xs">
            <h3 className="text-base font-bold text-[#17232D] uppercase tracking-wider mb-4">Why PlaySec</h3>
            <p className="text-sm text-[#60717D] leading-relaxed">
              Traditional training models often separate threat explanations from operational runbooks. PlaySec integrates these components. By presenting defensive engineering rules as structured, audio-enabled playbooks, we simulate real-time operations. This approach allows developers, administrators, and analysts to comprehend attack pathways and construct robust system boundary mitigations simultaneously.
            </p>
          </div>

          {/* Who It's For */}
          <div>
            <h3 className="text-base font-bold text-[#17232D] uppercase tracking-wider mb-6">Who It&apos;s For</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                "Students",
                "SOC Analysts",
                "Penetration Testers",
                "Blue Team Engineers",
                "Security Researchers",
              ].map((role) => (
                <div key={role} className="rounded border border-[#D9E4EA] bg-white p-4 text-center shadow-xs">
                  <span className="text-xs font-bold text-[#17232D]">{role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Vision */}
          <div className="rounded border border-[#D9E4EA] bg-white p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#F5F8FA] border border-[#D9E4EA] text-[#173B57]">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-[#17232D] uppercase tracking-wider">Platform Vision</h2>
            </div>
            <p className="text-sm text-[#60717D] leading-relaxed">
              PlaySec is expanding toward a fully integrated defensive engineering ecosystem. Our development roadmap includes simulated local lab environments, hands-on control verification modules, professional technical credentials, and secure collaborative channels for operations teams.
            </p>
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
