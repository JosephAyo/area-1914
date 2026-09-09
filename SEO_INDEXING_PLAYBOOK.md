# SEO and Google Indexing Playbook

Use this document to audit and improve SEO for JavaScript applications, especially client-rendered React/Vite sites deployed on Vercel.

## Objective

Make the site easy for search engines to discover, crawl, render, understand, and index. Passing these checks does not guarantee indexing, but it removes common technical barriers.

## Initial Audit

Check the deployed site rather than assuming local files match production.

### HTTP and indexability

- The preferred HTTPS URL returns `200 OK`.
- HTTP, `www`, and alternate deployment domains redirect to the preferred URL where appropriate.
- Pages do not contain `noindex` directives.
- Responses do not send an `X-Robots-Tag: noindex` header.
- Authentication, bot protection, or rate limiting does not block search crawlers.
- Canonical URLs point to the preferred production domain.

### Robots and sitemap

- `/robots.txt` returns plain text with `Content-Type: text/plain`.
- `/sitemap.xml` returns valid XML with an XML content type.
- Neither URL falls through to the SPA's `index.html` rewrite.
- The sitemap contains canonical, indexable URLs only.
- The robots file references the sitemap.

Minimal `robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

Minimal `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
</urlset>
```

### Page metadata

Every indexable page should have:

- A unique, descriptive `<title>`.
- A useful meta description.
- A self-referencing canonical URL.
- `robots` metadata allowing indexing.
- Open Graph and Twitter card metadata for sharing.
- A representative social image with an absolute URL.
- Appropriate structured data, such as `WebSite`, `Organization`, `Article`, or `Dataset`.

Example homepage metadata:

```html
<title>Descriptive Product Name and Purpose</title>
<meta
  name="description"
  content="A concise explanation of what users can find and do on this site."
/>
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="https://example.com/" />

<meta property="og:type" content="website" />
<meta property="og:title" content="Descriptive Product Name and Purpose" />
<meta property="og:description" content="A concise explanation of the site." />
<meta property="og:url" content="https://example.com/" />
<meta property="og:image" content="https://example.com/social-card.png" />

<meta name="twitter:card" content="summary_large_image" />
```

## JavaScript Application Requirements

Search engines can execute JavaScript, but rendering may be delayed or fail. A response whose body contains only an empty application root gives crawlers little information before rendering.

Prefer one of these approaches:

1. Server-side rendering for public, indexable pages.
2. Static generation or prerendering at build time.
3. A crawlable static landing page with the interactive application progressively enhanced.

Do not rely exclusively on content fetched after page load for critical titles, descriptions, headings, and internal links.

## Permanent Content URLs

Important content needs stable URLs. Avoid representing indexable pages only through component state, modals, or search selections.

For example:

```text
https://example.com/topics/fela-kuti
https://example.com/topics/nigerian-civil-war
```

Each content page should:

- Return meaningful HTML without requiring an interaction.
- Have unique metadata and a canonical URL.
- Be linked through a real `<a href="...">` element.
- Appear in the sitemap.
- Link to related pages through crawlable anchors.
- Provide useful original context rather than reproducing only third-party API data.

## Vercel and SPA Rewrites

A catch-all rewrite such as this can accidentally return `index.html` for missing SEO files:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Place real `robots.txt` and `sitemap.xml` files in the framework's public/static directory. Verify their deployed content types and bodies after deployment. Where necessary, narrow the catch-all rewrite so assets and SEO endpoints resolve normally.

## Search Console Workflow

1. Add and verify the domain property in Google Search Console.
2. Submit the production sitemap.
3. Use URL Inspection and run **Test live URL**.
4. Confirm the rendered page and resources load correctly.
5. Select **Request indexing** for the homepage and a small number of important pages.
6. Review Page Indexing, Crawl Stats, Manual Actions, Security Issues, and Core Web Vitals.
7. Recheck after several days. Crawling and indexing are not immediate or guaranteed.

The `site:example.com` search operator is useful as a quick signal but is not a definitive index report. Treat Search Console as the primary source.

## Deployment Verification

Replace `example.com` before running these checks:

```bash
curl -I https://example.com/
curl -i https://example.com/robots.txt
curl -i https://example.com/sitemap.xml
curl -s https://example.com/ | head -100
```

Confirm that:

- The homepage returns `200`.
- Robots is plain text and contains the sitemap URL.
- The sitemap is XML rather than the SPA shell.
- The initial HTML contains meaningful headings, text, metadata, and links.

Also validate:

- Structured data with Google's Rich Results Test.
- Mobile rendering and performance with PageSpeed Insights.
- Canonicals and index status with Search Console URL Inspection.
- Broken links and redirect chains with a crawler.

## Prioritization

### Phase 1: Remove indexing barriers

- Add valid robots and sitemap files.
- Add metadata, canonical tags, and structured data.
- Confirm there are no `noindex` directives.
- Verify production response bodies and content types.
- Submit the sitemap in Search Console.

### Phase 2: Make content discoverable

- Add permanent routes for important content.
- Replace non-link navigation with crawlable anchors where appropriate.
- Add internal links between related pages.
- Include canonical content routes in the sitemap.

### Phase 3: Improve rendered content

- Implement SSR, static generation, or prerendering.
- Give every public route unique metadata.
- Ensure essential content is present in initial HTML.
- Add useful original copy and contextual information.

### Phase 4: Improve quality and performance

- Optimize Core Web Vitals and image loading.
- Avoid large render-blocking bundles.
- Strengthen accessibility and semantic heading structure.
- Earn relevant external links and references.
- Monitor Search Console after each deployment.

## Agent Handoff Prompt

Use the following prompt when sharing this playbook with another project's agent:

> Audit this project's local code and deployed production site using `SEO_INDEXING_PLAYBOOK.md`. Verify findings against the live responses. Identify indexing blockers, distinguish quick fixes from architectural improvements, and implement the approved changes. Do not assume that robots, sitemap, metadata, routing, SSR, or canonical behavior works merely because source files exist. After implementation, run the project's tests/build and recheck the deployed or preview responses where available.

## Area1914 Findings at Time of Audit

The Area1914 production audit found:

- The homepage returned `200 OK` over HTTPS.
- `/robots.txt` returned the SPA HTML shell instead of a robots file.
- `/sitemap.xml` returned the SPA HTML shell instead of XML.
- The initial HTML contained a title and an empty `<div id="root">`, but no descriptive page content.
- There was no meta description, canonical URL, social metadata, or structured data.
- Topics were selected through React state rather than permanent crawlable URLs.
- Meaningful topic data loaded through client-side API requests.

For Area1914, Phase 1 should be completed immediately, followed by permanent prerendered or server-rendered topic pages.

## References

- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google Search Console](https://search.google.com/search-console/about)
