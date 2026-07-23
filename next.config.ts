import type { NextConfig } from "next";

// Security headers applied to every route.
// These are additive-only (no route behavior changes) and safe to ship
// without breaking existing functionality: Google OAuth popup/redirect,
// Supabase REST/Storage calls, and audio/image loading from Supabase
// Storage all remain allowed under this policy.
const securityHeaders = [
  {
    // Prevents the site from being embedded in an <iframe> on another
    // origin, mitigating clickjacking.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Stops browsers from MIME-sniffing a response away from its
    // declared Content-Type (reduces stored-file/XSS risk from uploads).
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Disables powerful browser features the app doesn't use.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    // Enforces HTTPS on repeat visits once deployed behind TLS (Vercel).
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js/Framer Motion/inline hydration scripts require these in the
      // App Router without a nonce-based setup; tightening further would
      // require introducing per-request nonces, which is a larger change.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "media-src 'self' https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
