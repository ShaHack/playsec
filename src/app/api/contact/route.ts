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
    const { targetType, formType, rating } = body;
    let { name, email, feedbackType, subject, priority, message } = body;

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

    // ── DATABASE PERSISTENCE ──
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
      } catch {
        // Silently handle persistence fallback
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
      } catch {
        // Silently handle persistence fallback
      }
    }

    // ── EMAIL DELIVERY VIA RESEND ──
    const apiKey = process.env.RESEND_API_KEY;
    const emailTypeLabel = isFeedback ? `Feedback (${feedbackType})` : `Support Ticket (${priority} Priority)`;
    const adminSubject = isFeedback 
      ? `[PlaySec Feedback] ${feedbackType} from ${name || "Anonymous"}`
      : `[PlaySec Support] ${subject}`;

    const submittedAt = new Date().toUTCString();
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    const adminTextBody = `
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
      const resend = new Resend(apiKey);

      // Email 1: Notification to playsec.platform@gmail.com
      try {
        await resend.emails.send({
          from: "PlaySec Community <onboarding@resend.dev>",
          to: ["playsec.platform@gmail.com"],
          replyTo: email || undefined,
          subject: adminSubject,
          text: adminTextBody,
        });
      } catch {
        // Silently continue if notification fails
      }

      // Email 2: Auto-responder confirmation email sent back to User (if email exists)
      if (email) {
        try {
          await resend.emails.send({
            from: "PlaySec Platform <onboarding@resend.dev>",
            to: [email],
            subject: "Thanks for contacting PlaySec",
            html: buildConfirmationHtml({
              name: name || "there",
              typeLabel: isFeedback ? `Feedback (${feedbackType})` : `Support Ticket (${priority} Priority)`,
              subject: isFeedback ? feedbackType : subject,
              submittedAt,
            }),
          });
        } catch {
          // Silently continue if user confirmation email fails
        }
      }
    }

    const successMessage = isFeedback
      ? "Thank you! Your feedback helps us improve PlaySec."
      : "Your support request has been received. Our team will contact you soon.";

    return NextResponse.json({
      success: true,
      message: successMessage,
    });

  } catch {
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper: Professional HTML Email Template Generator
function buildConfirmationHtml({
  name,
  typeLabel,
  subject,
  submittedAt
}: {
  name: string;
  typeLabel: string;
  subject: string;
  submittedAt: string;
}) {
  const safeName = escapeHtml(name);
  const safeTypeLabel = escapeHtml(typeLabel);
  const safeSubject = escapeHtml(subject);
  const safeSubmittedAt = escapeHtml(submittedAt);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanks for contacting PlaySec</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3F4F6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0F14; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #141A22; border: 1px solid #2A3442; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 28px 32px; background-color: #0F172A; border-bottom: 1px solid #2A3442; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">
                    PLAY<span style="color: #00F2FE;">SEC</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px; text-align: left;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #FFFFFF;">
                Hi ${safeName},
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #A8B3C5;">
                We have received your message. Our team will review it and respond as soon as possible.
              </p>

              <!-- Summary Card -->
              <div style="background-color: #0B0F14; border: 1px solid #2A3442; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 14px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #00F2FE;">
                  Summary
                </h3>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748B; width: 100px; font-weight: 600;">Type:</td>
                    <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">${safeTypeLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Subject:</td>
                    <td style="padding: 6px 0; color: #FFFFFF;">${safeSubject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Submitted:</td>
                    <td style="padding: 6px 0; color: #A8B3C5; font-family: monospace;">${safeSubmittedAt}</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #A8B3C5;">
                Thank you for using PlaySec.
              </p>

              <div style="border-top: 1px solid #2A3442; padding-top: 20px; text-align: left;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #FFFFFF;">PlaySec Team</p>
                <a href="https://playsec.vercel.app" target="_blank" style="font-size: 13px; color: #38BDF8; text-decoration: none;">https://playsec.vercel.app</a>
              </div>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="padding: 16px 32px; background-color: #0B0F14; border-top: 1px solid #2A3442; text-align: center; font-size: 11px; color: #64748B;">
              © ${new Date().getFullYear()} PlaySec Platform. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
