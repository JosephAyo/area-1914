const TOPIC_ROUTE_PREFIX = "/topics/";

export function normalizeTopicSlug(topic: string): string {
  return topic.trim().replace(/\s+/g, "_");
}

export function topicPath(topic: string): string {
  return `${TOPIC_ROUTE_PREFIX}${encodeURIComponent(normalizeTopicSlug(topic))}`;
}

export type AppRoute =
  | { view: "home"; topic: string | null }
  | { view: "discover"; topic: null };

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

  return { view: "home", topic: null };
}

export function pushAppRoute(path: string): void {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }
}
