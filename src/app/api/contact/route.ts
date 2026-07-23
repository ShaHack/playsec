import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

// In-Memory Rate Limiting & Cooldown Caches
interface RateLimitRecord {
  count: number;
  resetTime: number;
  lastSubmittedTime: number;
}

const ipCache = new Map<string, RateLimitRecord>();
const emailCache = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const maxRequestsPerWindow = 5;
    const cooldownMs = 30 * 1000;

    let ipRecord = ipCache.get(ip);
    if (!ipRecord || now > ipRecord.resetTime) {
      ipRecord = { count: 0, resetTime: now + windowMs, lastSubmittedTime: 0 };
    }

    // 1. IP Duplicate Cooldown Check (30 Seconds)
    if (ipRecord.lastSubmittedTime && now - ipRecord.lastSubmittedTime < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - (now - ipRecord.lastSubmittedTime)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec} seconds before submitting another request.` },
        { status: 429 }
      );
    }

    // 2. IP Rate Limit Window Check (Max 5 requests / 10 min)
    if (ipRecord.count >= maxRequestsPerWindow) {
      return NextResponse.json(
        { error: "Submission rate limit reached. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { targetType, formType, name, email, feedbackType, rating, subject, priority, message } = body;

    const isFeedback = targetType === "feedback" || (formType || "").toLowerCase() === "feedback";

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    subject = (subject || "").trim();
    message = (message || "").trim();
    feedbackType = (feedbackType || "General Feedback").trim();
    priority = (priority || "Medium").trim();
    const ratingVal = typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : 5;

    // Validation
    if (isFeedback) {
      // Name & Email are optional for feedback, but message is required (15 to 3000 chars)
      if (!message) {
        return NextResponse.json({ error: "Feedback message cannot be empty." }, { status: 400 });
      }
      if (message.length < 15) {
        return NextResponse.json({ error: "Feedback message must be at least 15 characters long." }, { status: 400 });
      }
      if (message.length > 3000) {
        return NextResponse.json({ error: "Feedback message cannot exceed 3000 characters." }, { status: 400 });
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
    } else {
      // Support Ticket requires Name, Email, Subject, Message
      if (!name) {
        return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
      if (!subject) {
        return NextResponse.json({ error: "Please enter a subject line." }, { status: 400 });
      }
      if (!message) {
        return NextResponse.json({ error: "Issue description cannot be empty." }, { status: 400 });
      }
      if (message.length < 15) {
        return NextResponse.json({ error: "Issue description must be at least 15 characters long." }, { status: 400 });
      }
      if (message.length > 3000) {
        return NextResponse.json({ error: "Issue description cannot exceed 3000 characters." }, { status: 400 });
      }
    }

    // Email duplicate cooldown check
    if (email) {
      const lastEmailSubmit = emailCache.get(email);
      if (lastEmailSubmit && now - lastEmailSubmit < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - (now - lastEmailSubmit)) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec} seconds before submitting another request.` },
          { status: 429 }
        );
      }
      emailCache.set(email, now);
    }

    // Update IP Cache
    ipRecord.count += 1;
    ipRecord.lastSubmittedTime = now;
    ipCache.set(ip, ipRecord);

    // ── DATABASE PERSISTENCE (Supabase feedback & support_tickets tables) ──
    if (isFeedback) {
      try {
        await supabase.from("feedback").insert([
          {
            name: name || "Anonymous User",
            email: email || null,
            feedback_type: feedbackType,
            rating: ratingVal,
            message,
          }
        ]);
      } catch (dbErr) {
        console.warn("[PlaySec Contact API] Supabase feedback insert notice:", dbErr);
      }
    } else {
      try {
        await supabase.from("support_tickets").insert([
          {
            name,
            email,
            subject,
            priority,
            message,
            status: "Open",
          }
        ]);
      } catch (dbErr) {
        console.warn("[PlaySec Contact API] Supabase support_tickets insert notice:", dbErr);
      }
    }

    // ── RESEND EMAIL NOTIFICATION ──
    const apiKey = process.env.RESEND_API_KEY;
    const emailTypeLabel = isFeedback ? `Feedback (${feedbackType} - ${ratingVal} Stars)` : `Support Ticket (${priority} Priority)`;
    const emailSubject = isFeedback 
      ? `[PlaySec Feedback] ${feedbackType} from ${name || "Anonymous"}`
      : `[PlaySec Support] ${subject}`;

    const submittedAt = new Date().toUTCString();
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    const textBody = `
-----------------------------------
PlaySec Community Form

Form Type:
${emailTypeLabel}

Name:
${name || "Anonymous"}

Email:
${email || "Not provided"}

Subject / Category:
${isFeedback ? feedbackType : subject}

Priority / Rating:
${isFeedback ? `${ratingVal} / 5 Stars` : priority}

Message:
${message}

Submitted At:
${submittedAt}

User Agent:
${userAgent}

-----------------------------------
    `.trim();

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "PlaySec Community <onboarding@resend.dev>",
          to: ["playsec.platform@gmail.com"],
          replyTo: email || undefined,
          subject: emailSubject,
          text: textBody,
        });
      } catch (rErr) {
        console.error("[PlaySec Contact API] Resend email notice:", rErr);
      }
    }

    const successMessage = isFeedback
      ? "Thank you! Your feedback helps us improve PlaySec."
      : "Your support request has been received. Our team will contact you soon.";

    return NextResponse.json({
      success: true,
      message: successMessage,
    });

  } catch (err: unknown) {
    console.error("[PlaySec Contact API] Exception:", err);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 500 }
    );
  }
}
