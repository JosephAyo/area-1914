# Feature Ideas for "The Nigerian History Pulse"

Here are some compelling, modern feature ideas designed to boost the "viral, casual-browser" appeal of the application, categorized by their primary goal:

## 🪲 Bug Fixes

### 1. Home Page

~~- Unable to exit pulse page on mobile. There's no close button.~~
~~- Trending section is at the bottom on mobile, it should be at the top. We could have a floating cta to scroll to trending~~
~~- Bug in Trending logic, a page that previously had 0 views suddenly jumps to 100% increase with 1 view and becomes number 1 trending.~~

## Refactoring

don't you think that "POST "http://127.0.0.1:8000/api/topics/batch"" should be a GET request and the default searches be handled on the backend?

## 🚀 Virality & Social Sharing

### 1. Comparison Mode ("VS" Mode)

Allow users to search for two topics simultaneously and overlay their pulse charts.

- **Why it works:** People love comparisons. Showing the historical pageview battles between "Wizkid vs Davido", "APC vs PDP", or historical figures is highly engaging.
- **Implementation:** Update the `PulseChart` to accept multiple datasets and draw multiple area lines with different colors.

### 2. "Share this Pulse" (Image Export)

A button that generates a clean, aesthetic image (PNG) containing the Topic Card, the current chart view, and a small "Nigerian History Pulse" watermark.

- **Why it works:** Users can instantly share interesting data spikes directly to Twitter, Instagram, or WhatsApp without sending a link that might get ignored.
- **Implementation:** Use a library like `html2canvas` to take a snapshot of the chart/card container.

---

## 🧠 Analytical Depth

### 3. "Why did this trend?" (Event Annotations)

When there is a massive, sudden spike in the chart (e.g., 500% increase in one day), provide context on _why_.

- **Why it works:** Spikes are interesting, but context is engaging.
- **Implementation:** This could be done by manually hardcoding major events, or by integrating an LLM (like Gemini or OpenAI) in the backend to automatically search the news/web for that specific date and topic to generate a one-sentence summary.

### 4. "On This Day" / Anniversary Widget

A daily rotating section on the home page highlighting historical Nigerian topics that had significant activity exactly 1, 5, or 10 years ago today.

- **Why it works:** Gives users a reason to return to the app daily.
- **Implementation:** A backend cron task that queries the database for large pageview counts on today's month/day in previous years.

### 5. Related/Connected Topics

When viewing a topic (e.g., "Olusegun Obasanjo"), show a list of tightly linked topics (e.g., "Murtala Muhammed", "Nigerian Civil War").

- **Why it works:** Creates a "Wikipedia rabbit hole" effect directly within your app, keeping users engaged longer.
- **Implementation:** Use Wikipedia's "links" API or cross-reference the citations/categories to find other topics already in your database.

---

## 🎨 User Experience (UX) improvements

~~### 6. Dark/Light Mode Toggle~~

~~While the dark glassmorphic UI is stunning, offering a high-contrast light mode can improve accessibility and user preference.~~

### 7. Search Auto-complete with Thumbnails

Currently, search suggestions are just text. Adding the Wikipedia thumbnail next to the text in the dropdown makes the search feel instantly premium.

- **Why it works:** Visual feedback confirms to the user they are selecting the right person/event before they even click.
