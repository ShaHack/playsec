export interface LibraryResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  category: "Offensive Security" | "Defensive Security" | "Cloud Security" | "Web Security" | "Digital Forensics" | "Threat Hunting" | "Malware Analysis" | "Secure Coding" | "Incident Response";
  subcategory?: string;
  thumbnail: string;
  file_url: string;
  file_type: string;
  tags: string[];
  updated_date?: string;
  featured?: boolean;
  published?: boolean;
}
