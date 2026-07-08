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

export interface FeaturedCategory {
  name: string;
  icon: string;
  topics: TopicData[];
}

export interface RelatedTopic {
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  connection: string;
}

export interface OnThisDayTopic {
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  date: string;
  years_ago: number;
  views: number;
  baseline_views: number;
  lift_score: number;
}
