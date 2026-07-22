export interface LibraryResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  file_url: string;
  file_type: string;
  category: "Offensive Security" | "Defensive Security" | "Cloud Security" | "Web Security" | "Digital Forensics" | "Threat Hunting" | "Malware Analysis" | "Secure Coding" | "Incident Response";
  subcategory?: string;
  author: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  featured?: boolean;
}
