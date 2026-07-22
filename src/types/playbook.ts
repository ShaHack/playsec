export interface AudioPlaybook {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  category: "Audio Briefings" | "Case Studies" | "Incident Walkthroughs" | "Security Talks";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  duration: string;
  cover_image: string;
  audio_url: string;
  tags: string[];
  updated_date?: string;
  featured?: boolean;
  published?: boolean;
}
