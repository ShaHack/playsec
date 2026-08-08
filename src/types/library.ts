export interface LibraryResource {
  id: string;
  slug: string;
  title: string;
  description?: string;
  author?: string;
  security_side: "offensive" | "defensive";
  category?: string;
  resource_type?: string;
  subcategory?: string;
  storage_path?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  file_url: string;
  file_type?: string;
  file_size?: string;
  file_format?: string;
  tags?: string[];
  updated_date?: string;
  created_at?: string;
  updated_at?: string;
  featured?: boolean;
  published?: boolean;
}
