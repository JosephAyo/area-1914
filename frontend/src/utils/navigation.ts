const TOPIC_ROUTE_PREFIX = "/topics/";

export function normalizeTopicSlug(topic: string): string {
  return topic.trim().replace(/\s+/g, "_");
}

export function topicPath(topic: string): string {
  return `${TOPIC_ROUTE_PREFIX}${encodeURIComponent(normalizeTopicSlug(topic))}`;
}

export type AppRoute =
  | { view: "home"; topic: string | null }
  | { view: "discover"; topic: null }
  | { view: "stories"; topic: null; story: string | null; subject?: string };

export function storyPath(story: string | null = null): string {
  return story ? `/stories/${encodeURIComponent(story)}` : "/stories";
}

export function subjectStoryPath(subject: string): string {
  return `/stories/subjects/${encodeURIComponent(normalizeTopicSlug(subject))}`;
}

export function readAppRoute(pathname = window.location.pathname): AppRoute {
  const topicMatch = pathname.match(/^\/topics\/([^/]+)\/?$/);
  if (topicMatch) {
    try {
      return {
        view: "home",
        topic: normalizeTopicSlug(decodeURIComponent(topicMatch[1])),
      };
    } catch {
      return { view: "home", topic: null };
    }
  }

  if (/^\/discover\/?$/.test(pathname)) {
    return { view: "discover", topic: null };
  }

  const subjectMatch = pathname.match(/^\/stories\/subjects\/([^/]+)\/?$/);
  const storyMatch = pathname.match(/^\/stories(?:\/([^/]+))?\/?$/);
  try {
    if (subjectMatch)
      return {
        view: "stories",
        topic: null,
        story: "subject",
        subject: normalizeTopicSlug(decodeURIComponent(subjectMatch[1])),
      };
    if (storyMatch)
      return {
        view: "stories",
        topic: null,
        story: storyMatch[1] ? decodeURIComponent(storyMatch[1]) : null,
      };
  } catch {
    return { view: "home", topic: null };
  }

  return { view: "home", topic: null };
}

export function pushAppRoute(path: string): void {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }
}
