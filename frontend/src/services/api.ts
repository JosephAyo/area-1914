import type {
  TopicData,
  TrendingArticle,
  CitationData,
  SearchSuggestion,
  FeaturedCategory,
} from "../types/index";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const fetchTopicData = async (slug: string): Promise<TopicData> => {
  const response = await fetch(
    `${API_BASE_URL}/topics/${encodeURIComponent(slug)}`,
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Topic not found on Wikipedia.");
    }
    if (response.status === 422) {
      const data = await response.json();
      throw new Error(
        data.detail || "This topic doesn't appear to be related to Nigeria.",
      );
    }
    throw new Error("Failed to fetch topic data.");
  }
  return response.json();
};

export const fetchTrendingData = async (): Promise<TrendingArticle[]> => {
  const response = await fetch(`${API_BASE_URL}/trending`);
  if (!response.ok) {
    throw new Error("Failed to fetch trending data.");
  }
  return response.json();
};

export const fetchCitationSources = async (
  slug: string,
): Promise<CitationData> => {
  const response = await fetch(
    `${API_BASE_URL}/topics/${encodeURIComponent(slug)}/sources`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch citation sources.");
  }
  return response.json();
};

export const fetchFeaturedTopics = async (): Promise<FeaturedCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/topics/featured`);
  if (!response.ok) {
    throw new Error("Failed to fetch featured topics.");
  }
  return response.json();
};

export const fetchSearchResults = async (
  query: string,
): Promise<SearchSuggestion[]> => {
  const response = await fetch(
    `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch search results.");
  }
  return response.json();
};
