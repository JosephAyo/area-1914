import type { MouseEvent, ReactNode } from "react";
import { topicPath } from "../utils/navigation";

interface TopicLinkProps {
  slug: string;
  onSelectTopic: (slug: string) => void;
  className?: string;
  children: ReactNode;
}

export function TopicLink({
  slug,
  onSelectTopic,
  className,
  children,
}: TopicLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onSelectTopic(slug);
  };

  return (
    <a href={topicPath(slug)} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
