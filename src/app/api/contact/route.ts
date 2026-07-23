import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formType, name, email, subject, message } = body;

    // 1. Validate every required field
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const isFeedback = (formType || "").toLowerCase() === "feedback";
    const emailTypeLabel = isFeedback ? "Feedback" : "Support";
    const emailSubject = `[PlaySec ${emailTypeLabel}] ${subject.trim()}`;
    const submittedAt = new Date().toUTCString();
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    const textBody = `
-----------------------------------
PlaySec Community Form

Form Type:
${emailTypeLabel}

Name:
${name.trim()}

Email:
${email.trim()}

Subject:
${subject.trim()}

Message:
${message.trim()}

Submitted At:
${submittedAt}

User Agent:
${userAgent}

-----------------------------------
    `.trim();

    // 2. Dev mode fallback if RESEND_API_KEY is missing
    if (!apiKey) {
      console.warn("[PlaySec Resend Integration] RESEND_API_KEY environment variable is not defined.");
      console.log("[PlaySec Simulated Email Payload]:\n", textBody);
      return NextResponse.json({
        success: true,
        message: "Your message has been processed successfully."
      });
    }

    // 3. Send email via official Resend SDK
    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send({
      from: "PlaySec Community <onboarding@resend.dev>",
      to: ["playsec.platform@gmail.com"],
      replyTo: email.trim(),
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
    console.error("[PlaySec Contact API] Exception:", err);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 500 }
    );
  }
}
