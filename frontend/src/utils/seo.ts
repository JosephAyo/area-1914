const SITE_URL = "https://area1914.ayojoseph.dev";
const SITE_NAME = "The Nigerian History Pulse";

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  image?: string;
}

function setMeta(
  selector: string,
  attribute: "name" | "property",
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, selector.match(/\[.+="(.+)"\]/)?.[1] || "");
    document.head.appendChild(element);
  }
  element.content = content;
}

export function updatePageMetadata({
  title,
  description,
  path,
  image,
}: PageMetadata): void {
  const url = new URL(path, SITE_URL).toString();
  document.title = title;

  setMeta('meta[name="description"]', "name", description);
  setMeta('meta[property="og:title"]', "property", title);
  setMeta('meta[property="og:description"]', "property", description);
  setMeta('meta[property="og:url"]', "property", url);
  setMeta('meta[name="twitter:title"]', "name", title);
  setMeta('meta[name="twitter:description"]', "name", description);

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  if (image) {
    setMeta('meta[property="og:image"]', "property", image);
    setMeta('meta[name="twitter:image"]', "name", image);
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
  } else {
    document.head.querySelector('meta[property="og:image"]')?.remove();
    document.head.querySelector('meta[name="twitter:image"]')?.remove();
    setMeta('meta[name="twitter:card"]', "name", "summary");
  }
}

export const defaultMetadata: PageMetadata = {
  title: `${SITE_NAME} | Explore Nigerian History`,
  description:
    "Explore five years of Wikipedia interest in Nigerian history, people, culture, politics, and major events through interactive pageview charts.",
  path: "/",
};
