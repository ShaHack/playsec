export interface PlaybookProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  updatedDate: string;
  coverImage: string;
  audio: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  author: string;
  tags: string[];
}

export const playbooks: PlaybookProduct[] = [
  {
    id: "playbook-001",
    slug: "api-bola-prevention",
    title: "Securing APIs Against Broken Object Level Authorization (BOLA)",
    description: "Learn how to detect, exploit, and implement zero-trust access controls to prevent authorization bypasses on object resources using our expert-led audio walkthrough.",
    updatedDate: "July 19, 2026",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "API Security",
    difficulty: "Intermediate",
    author: "PlaySec SecOps Team",
    tags: ["OWASP Top 10", "BOLA", "Access Control", "API Protection"]
  },
  {
    id: "playbook-002",
    slug: "cyber-forensics-incident-response",
    title: "Digital Forensics & Incident Response",
    description: "An operational audio briefing detailing network logs captures analysis, memory dumping guidelines, and chain of custody practices during post-compromise mitigation.",
    updatedDate: "July 18, 2026",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "Incident Response",
    difficulty: "Advanced",
    author: "DFIR Specialists Group",
    tags: ["DFIR", "Incident Response", "Forensics", "NIST IR"]
  }
];
