import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchResults } from "../services/api";
import type { SearchSuggestion } from "../types/index";
import styles from "./TopicSearch.module.scss";

interface TopicSearchProps {
  onSearch: (topic: string | null) => void;
  activeTopic: string | null;
}

export function TopicSearch({ onSearch, activeTopic }: TopicSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local state during render when the activeTopic prop changes
  const [prevTopic, setPrevTopic] = useState(activeTopic);
  if (activeTopic !== prevTopic) {
    setPrevTopic(activeTopic);
    setQuery(activeTopic || "");
    setDebouncedQuery("");
  }

  // Simple debounce logic inline for search to avoid external deps if not present
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions, isLoading } = useQuery<SearchSuggestion[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
  });

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // If we submit the form directly, we can either submit the query string
      // or map to the first suggestion. Given user typically hits enter after typing an exact or close name.
      // We take the first suggestion if available to resolve exact slug, otherwise use query.
      const resolvedQuery =
        suggestions && suggestions.length > 0
          ? suggestions[0].title
          : query.trim();
      onSearch(resolvedQuery);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    onSearch(null); // Return to home view
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    onSearch(suggestion.title);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className={styles.searchContainer} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a Nigerian topic (e.g. Lagos, Fela Kuti)..."
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          {isOpen && debouncedQuery.trim().length > 1 && (
            <div className={styles.dropdown}>
              {isLoading ? (
                <div className={styles.dropdownLoading}>Searching...</div>
              ) : suggestions && suggestions.length > 0 ? (
                <ul className={styles.dropdownList}>
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelect(suggestion)}
                      className={styles.dropdownItem}
                    >
                      {suggestion.thumbnail ? (
                        <img
                          src={suggestion.thumbnail}
                          alt=""
                          className={styles.dropdownThumbnail}
                        />
                      ) : (
                        <div className={styles.dropdownThumbnailPlaceholder} />
                      )}
                      <span>{suggestion.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.dropdownLoading}>No results found</div>
              )}
            </div>
          )}
        </div>
        <button type="submit" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>
    </div>
  );
}
