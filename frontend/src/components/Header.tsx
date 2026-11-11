import type { MouseEvent } from "react";
import { useTheme } from "../context/useTheme";
import ui from "./Header.module.scss";
interface HeaderProps {
  onHomeClick: () => void;
  onStoriesClick: () => void;
  view: "home" | "discover" | "topic" | "stories";
}
export function Header({ onHomeClick, onStoriesClick, view }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = (
    event: MouseEvent<HTMLAnchorElement>,
    action: () => void,
  ) => {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    action();
  };
  return (
    <header className={ui.header}>
      <a
        href="/"
        className={ui.logo}
        onClick={(event) => navigate(event, onHomeClick)}
      >
        <img src="/favicon.svg" alt="" width="36" height="36" />
        <span>
          The Nigerian
          <br />
          <strong>History Pulse</strong>
        </span>
      </a>
      <nav className={ui.nav} aria-label="Main navigation">
        <a
          href="/"
          aria-current={view !== "stories" ? "page" : undefined}
          onClick={(event) => navigate(event, onHomeClick)}
        >
          Explore
        </a>
        <a
          href="/stories"
          aria-current={view === "stories" ? "page" : undefined}
          onClick={(event) => navigate(event, onStoriesClick)}
        >
          Stories
        </a>
      </nav>
      <button
        type="button"
        className={ui.themeToggle}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "paper" : "night"} mode`}
      >
        {theme === "dark" ? "Paper" : "Night"}
      </button>
    </header>
  );
}
