export interface AudioPlaybook {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image: string;
  audio_url: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: "Audio Briefings" | "Case Studies" | "Incident Walkthroughs" | "Security Talks";
  author: string;
  languages: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  featured?: boolean;
}
