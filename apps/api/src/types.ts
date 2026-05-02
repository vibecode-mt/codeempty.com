export interface ContentItem {
  item_id: string;
  type: 'image' | 'youtube' | 'title' | 'html' | 'url' | 'code';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  section_id: string;
  page_id: string;
  section_order: number;
  section_title?: string;
  content_items: ContentItem[];
}

export interface Page {
  page_id: string;
  type: 'home' | 'project' | 'about' | 'blog';
  slug: string;
  title: string;
  sections: PageSection[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthApp {
  app_id: string;
  app_name: string;
  api_key: string;
  created_at: string;
  revoked: boolean;
}

export interface AdminUser {
  admin_id: string;
  email: string;
  created_at: string;
}
