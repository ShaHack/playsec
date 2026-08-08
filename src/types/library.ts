export interface LibraryResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  security_domain: "offensive" | "defensive";
  category: "Offensive Security" | "Defensive Security";
  resource_type: string;
  subcategory?: string;
  storage_path?: string;
  thumbnail?: string;
  file_url: string;
  file_type: string;
  file_size?: string;
  file_format?: string;
  tags: string[];
  updated_date?: string;
  featured?: boolean;
  published?: boolean;
}
