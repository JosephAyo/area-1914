const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchTopicData = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/topics/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Topic not found on Wikipedia.");
    }
    throw new Error("Failed to fetch topic data.");
  }
  return response.json();
};

export const fetchTrendingData = async () => {
  const response = await fetch(`${API_BASE_URL}/trending`);
  if (!response.ok) {
    throw new Error("Failed to fetch trending data.");
  }
  return response.json();
};

export const fetchCitationSources = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/topics/${encodeURIComponent(slug)}/sources`);
  if (!response.ok) {
    throw new Error("Failed to fetch citation sources.");
  }
  return response.json();
};

export const fetchSearchResults = async (query) => {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch search results.");
  }
  return response.json();
};
