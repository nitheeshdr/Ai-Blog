// ============================================================
// GLOBAL TYPE DEFINITIONS
// ============================================================

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  featured_image: string | null;
  author: string;
  author_avatar: string | null;
  category_id: string | null;
  category?: Category;
  tags: string[];
  reading_time: number;
  status: "draft" | "published" | "archived";
  language: string;
  views: number;
  seo_score: number;
  schema_json: Record<string, unknown> | null;
  faqs_json: FAQ[] | null;
  toc_json: TOCItem[] | null;
  social_caption: string | null;
  internal_links: string[];
  related_post_ids: string[];
  ai_model_used: string | null;
  tokens_used: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

export interface TrendingTopic {
  id: string;
  keyword: string;
  trend_score: number;
  source: string;
  difficulty: "low" | "medium" | "high";
  cpc_estimate: number;
  search_volume: number;
  status: "pending" | "processing" | "done" | "failed" | "skipped";
  post_id: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  type: string;
  status: "running" | "success" | "failed" | "skipped";
  message: string | null;
  api_used: string | null;
  tokens_used: number;
  duration_ms: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Analytics {
  id: string;
  post_id: string | null;
  date: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
  organic_traffic: number;
  referrer: string | null;
  country: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  unsubscribed: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  parent_id: string | null;
  created_at: string;
  children?: Comment[];
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================
// GENERATION TYPES
// ============================================================
export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  category: string;
  faqs: FAQ[];
  toc: TOCItem[];
  social_caption: string;
  reading_time: number;
  seo_score: number;
}

export interface AdminStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalCategories: number;
  totalSubscribers: number;
  pendingTopics: number;
  avgSeoScore: number;
  lastPublishedAt: string | null;
  recentLogs: AutomationLog[];
}
