export interface PageviewEntry {
  date: string;
  views: number;
}

export interface TopicData {
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  pageviews: PageviewEntry[];
}

export interface TrendingArticle {
  slug: string;
  title: string;
  description?: string;
  trend_score: number;
  current_views: number;
}

export interface CitationData {
  total_citations: number;
  category_breakdown: Record<string, number>;
  top_sources: string[];
}

export interface CuratedCategory {
  name: string;
  icon: string;
  slugs: string[];
  randomize?: boolean;
}

export interface SearchSuggestion {
  title: string;
  thumbnail?: string | null;
}
