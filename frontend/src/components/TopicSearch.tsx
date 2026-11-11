import { useState, useRef, useEffect, useId } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchResults } from "../services/api";
import { resolveSearchSelection } from "../utils/search";
import styles from "./TopicSearch.module.scss";
interface TopicSearchProps {
  onSearch: (topic: string | null) => void;
  activeTopic: string | null;
  label?: string;
  placeholder?: string;
  queryValue?: string;
  onQueryChange?: (query: string) => void;
  autoFocus?: boolean;
}
export function TopicSearch({
  onSearch,
  activeTopic,
  label = "Search the archive",
  placeholder = "Try Lagos, Fela Kuti, an event…",
  queryValue,
  onQueryChange,
  autoFocus = false,
}: TopicSearchProps) {
  const [localQuery, setLocalQuery] = useState(
    activeTopic?.replace(/_/g, " ") || "",
  );
  const query = queryValue ?? localQuery;
  const setQuery = (value: string) => {
    setLocalQuery(value);
    onQueryChange?.(value);
  };
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [prevTopic, setPrevTopic] = useState(activeTopic);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  if (activeTopic !== prevTopic) {
    setPrevTopic(activeTopic);
    setLocalQuery(activeTopic?.replace(/_/g, " ") || "");
    setDebouncedQuery("");
    setSelectedIndex(-1);
    setIsOpen(false);
  }
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const { data, isFetching, isError } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: isOpen && debouncedQuery.length > 1,
    retry: false,
  });
  const currentResults = debouncedQuery === query.trim();
  const suggestions = currentResults && !isError ? data || [] : [];
  const dropdownOpen = isOpen && query.trim().length > 1;
  const pending = !currentResults || isFetching;
  const selectable = !pending && !isError ? suggestions : [];
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);
  const choose = (title: string) => {
    setQuery(title);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearch(title);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const title = resolveSearchSelection(query, selectable, selectedIndex);
    if (title) choose(title);
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
    if (
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      selectable.length
    ) {
      event.preventDefault();
      setIsOpen(true);
      setSelectedIndex((index) =>
        event.key === "ArrowDown"
          ? (index + 1) % selectable.length
          : index <= 0
            ? selectable.length - 1
            : index - 1,
      );
    }
  };
  useEffect(() => {
    if (selectedIndex >= 0) {
      const option = rootRef.current?.querySelector<HTMLElement>(
        `[data-option-index="${selectedIndex}"]`,
      );
      const list = option?.parentElement;
      if (list && option) {
        const top = option.offsetTop - list.offsetTop;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (top + option.offsetHeight > list.scrollTop + list.clientHeight)
          list.scrollTop = top + option.offsetHeight - list.clientHeight;
      }
    }
  }, [selectedIndex]);
  return (
    <div
      className={styles.searchContainer}
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
    >
      <form
        className={styles.searchForm}
        onSubmit={submit}
        role="search"
        aria-label={label}
      >
        <label className={styles.visuallyHidden} htmlFor={id}>
          {label}
        </label>
        <div className={styles.inputWrapper}>
          <input
            id={id}
            ref={inputRef}
            autoFocus={autoFocus}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={dropdownOpen}
            aria-controls={dropdownOpen ? `${id}-results` : undefined}
            aria-activedescendant={
              dropdownOpen && selectable[selectedIndex]
                ? `${id}-option-${selectedIndex}`
                : undefined
            }
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={keyDown}
            placeholder={placeholder}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                setIsOpen(false);
                setSelectedIndex(-1);
                onSearch(null);
                inputRef.current?.focus();
              }}
            >
              ×
            </button>
          )}
        </div>
        <button
          className={styles.submit}
          type="submit"
          aria-label="Search the archive"
        >
          Search
        </button>
      </form>
      {dropdownOpen && (
        <div className={styles.dropdown}>
          <ul
            role="listbox"
            id={`${id}-results`}
            aria-label="Suggested subjects"
            aria-busy={pending}
          >
            {selectable.map((suggestion, index) => (
              <li
                key={suggestion.title}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                data-option-index={index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(suggestion.title)}
              >
                {suggestion.thumbnail ? (
                  <img src={suggestion.thumbnail} alt="" />
                ) : (
                  <span className={styles.initial} aria-hidden="true">
                    {suggestion.title[0]}
                  </span>
                )}
                <span>{suggestion.title}</span>
              </li>
            ))}
          </ul>
          <p role="status" className={styles.status}>
            {pending
              ? "Searching the archive…"
              : isError
                ? "Suggestions are unavailable. Enter a subject name and press Search."
                : !selectable.length
                  ? "No suggestions. You can still search by subject name."
                  : `${selectable.length} suggestions. Use arrow keys to choose, then Enter.`}
          </p>
        </div>
      )}
    </div>
  );
}
