import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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
    // Extract IP address from request headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxRequestsPerWindow = 5;
    const cooldownMs = 30 * 1000; // 30 seconds

    let ipRecord = ipCache.get(ip);
    if (!ipRecord || now > ipRecord.resetTime) {
      ipRecord = { count: 0, resetTime: now + windowMs, lastSubmittedTime: 0 };
    }

    // 1. IP Duplicate Cooldown Check (30 Seconds)
    if (ipRecord.lastSubmittedTime && now - ipRecord.lastSubmittedTime < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - (now - ipRecord.lastSubmittedTime)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec} seconds before submitting another message.` },
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

    // Parse Body
    const body = await req.json();
    let { formType, name, email, subject, message } = body;

    // 3. Trim leading and trailing spaces
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    subject = (subject || "").trim();
    message = (message || "").trim();

    // 4. Validate Name
    if (!name) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    // 5. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // 6. Email Duplicate Cooldown Check (30 Seconds)
    const lastEmailSubmit = emailCache.get(email);
    if (lastEmailSubmit && now - lastEmailSubmit < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - (now - lastEmailSubmit)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec} seconds before submitting another message.` },
        { status: 429 }
      );
    }

    // 7. Validate Subject
    if (!subject) {
      return NextResponse.json({ error: "Please enter a subject line." }, { status: 400 });
    }

    // 8. Validate Message Length & Content
    if (!message) {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 });
    }
    if (message.length < 15) {
      return NextResponse.json(
        { error: "Message is too short. Please provide at least 15 characters." },
        { status: 400 }
      );
    }
    if (message.length > 3000) {
      return NextResponse.json(
        { error: "Message is too long. Maximum allowed length is 3000 characters." },
        { status: 400 }
      );
    }

    // Update IP and Email Caches
    ipRecord.count += 1;
    ipRecord.lastSubmittedTime = now;
    ipCache.set(ip, ipRecord);
    emailCache.set(email, now);

    const apiKey = process.env.RESEND_API_KEY;
    const isFeedback = (formType || "").toLowerCase() === "feedback";
    const emailTypeLabel = isFeedback ? "Feedback" : "Support";
    const emailSubject = `[PlaySec ${emailTypeLabel}] ${subject}`;
    const submittedAt = new Date().toUTCString();
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    const textBody = `
-----------------------------------
PlaySec Community Form

Form Type:
${emailTypeLabel}

Name:
${name}

Email:
${email}

Subject:
${subject}

Message:
${message}

Submitted At:
${submittedAt}

User Agent:
${userAgent}

-----------------------------------
    `.trim();

    // Dev mode fallback if RESEND_API_KEY is missing
    if (!apiKey) {
      console.warn("[PlaySec Contact API] RESEND_API_KEY environment variable is missing.");
      console.log("[PlaySec Simulated Email Body]:\n", textBody);
      return NextResponse.json({
        success: true,
        message: "Your message has been sent successfully."
      });
    }

    // Send email using Resend SDK
    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send({
      from: "PlaySec Community <onboarding@resend.dev>",
      to: ["playsec.platform@gmail.com"],
      replyTo: email,
      subject: emailSubject,
      text: textBody,
    });

    if (sendError) {
      console.error("[PlaySec Contact API] Resend error:", sendError);
      return NextResponse.json(
        { error: "Unable to send your message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully."
    });
  } catch (err: unknown) {
    console.error("[PlaySec Contact API] Server Error:", err);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 500 }
    );
  }
}
