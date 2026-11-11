(() => {
  "use strict";
  const snapshot = window.EXPLORER_SNAPSHOT;
  const model = window.ExplorerModel;
  const main = document.getElementById("main");
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const date = (value) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));
  const number = (value) => value.toLocaleString("en");
  const shortNumber = (value) =>
    new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  const state = {
    query: "",
    category: "All subjects",
    sort: "read",
    layout: "grid",
    density: "comfortable",
    dataState: "ready",
    preview: "Fela_Kuti",
    period: 30,
    comparing: false,
    comparisonSlug: "",
    route: { view: "explore" },
  };
  const find = (slug) =>
    snapshot.subjects.find((subject) => subject.slug === slug);
  let toastTimer;

  function toast(message) {
    const target = document.getElementById("toast");
    target.textContent = message;
    target.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      target.hidden = true;
    }, 5000);
  }

  function spark(subject) {
    const points = model.series(subject, 30, snapshot.through);
    const max = Math.max(1, ...points.map((point) => point.views ?? 0));
    let path = "",
      connected = false;
    points.forEach((point, index) => {
      if (point.views === null) {
        connected = false;
        return;
      }
      path += `${connected ? "L" : "M"}${((index / 29) * 136 + 2).toFixed(2)},${(35 - (point.views / max) * 30).toFixed(2)} `;
      connected = true;
    });
    return `<svg class="spark" viewBox="0 0 140 40" width="140" height="40" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke" /></svg>`;
  }

  function resultRow(subject, index) {
    const stats = model.stats(subject, snapshot.through);
    const change =
      stats.growth === null
        ? `${stats.recordedDays}/30 recorded days`
        : `${stats.growth >= 0 ? "+" : ""}${stats.growth.toFixed(1)}% vs prior 30 days`;
    return `<a class="subject-row" href="${model.topicHref(subject.slug)}" data-subject="${esc(subject.slug)}" ${state.layout === "split" && state.preview === subject.slug ? 'aria-current="true"' : ""}>
      <div class="subject-identity"><span class="subject-number">${String(index + 1).padStart(2, "0")}</span><div class="subject-copy"><h3>${esc(subject.title)}</h3><p>${esc(subject.description)}</p><span class="category-label">${subject.category}</span></div></div>
      <div class="subject-stat">${number(stats.total)}<small>${change}</small></div>${spark(subject)}
    </a>`;
  }

  function previewCard(subject) {
    if (!subject) return "";
    const stats = model.stats(subject, snapshot.through);
    return `<span class="tag">${subject.category} · Quick preview</span><h2>${esc(subject.title)}</h2><p>${esc(subject.description)}</p><div class="subject-stat">${number(stats.total)}<small>recorded views · recent 30 days</small></div>${spark(subject)}<a class="primary-button" href="${model.topicHref(subject.slug)}">Open subject</a>`;
  }

  function renderResults() {
    const container = document.getElementById("results");
    if (!container) return;
    const filtered = model.filterSubjects(
      snapshot.subjects,
      state,
      snapshot.through,
    );
    const resultText = document.getElementById("result-count");
    resultText.textContent =
      state.dataState === "loading"
        ? "Loading subjects…"
        : state.dataState === "error"
          ? "Collection unavailable"
          : state.dataState === "empty"
            ? "No subjects yet"
            : `${filtered.length} ${filtered.length === 1 ? "subject" : "subjects"}${state.query ? ` matching “${state.query}”` : state.category === "All subjects" ? " to explore" : ` in ${state.category.toLowerCase()}`}`;
    document
      .querySelectorAll("[data-category]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.category === state.category),
        ),
      );
    container.dataset.layout = state.layout;
    if (state.dataState === "loading") {
      container.innerHTML =
        '<div class="loading-state" role="status" aria-busy="true"><span class="sr-only">Loading subjects…</span><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';
      return;
    }
    if (state.dataState === "error") {
      container.innerHTML =
        '<div class="empty-state" role="alert"><h2>The collection couldn’t be loaded.</h2><p>Your search is still here. Try loading the cached records again.</p><button class="secondary-button" type="button" data-action="retry">Try again</button></div>';
      return;
    }
    if (state.dataState === "empty" || !filtered.length) {
      container.innerHTML = `<div class="empty-state"><h2>${state.dataState === "empty" ? "No subjects in this collection yet." : "No matching subjects."}</h2><p>${state.dataState === "empty" ? "This is the empty-state preview. Restore the cached collection to continue." : "Try a shorter name or a different category. This prototype contains twelve cached subjects."}</p><button class="secondary-button" type="button" data-action="${state.dataState === "empty" ? "retry" : "clear"}">${state.dataState === "empty" ? "Restore collection" : "Clear filters"}</button></div>`;
      return;
    }
    if (!filtered.some((subject) => subject.slug === state.preview))
      state.preview = filtered[0].slug;
    container.innerHTML = `<div class="subject-list">${filtered.map(resultRow).join("")}</div><aside class="preview-card" aria-label="Selected subject preview" aria-live="polite">${previewCard(find(state.preview))}</aside>`;
    document
      .querySelectorAll("[data-category]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.category === state.category),
        ),
      );
  }

  function renderExplore() {
    document.title = "Explore · The Nigerian History Pulse";
    main.innerHTML = `<div class="page-heading"><div><h1>Explore Nigerian history</h1><p>Find a subject. See how reading interest changes.</p></div><div class="date-note"><span>Cached Wikipedia records</span><span>Through ${date(snapshot.through)}</span></div></div>
      <form id="subject-search" class="search-form" role="search" aria-label="Search subjects"><span class="search-icon" aria-hidden="true">⌕</span><label class="sr-only" for="search-input">Search people, places and events</label><input id="search-input" type="search" value="${esc(state.query)}" placeholder="Search people, places and events…" autocomplete="off" /><button type="submit" class="primary-button">Search</button></form>
      <div class="filter-line"><div class="category-tabs" role="group" aria-label="Subject category">${["All subjects", "Culture", "People", "Places", "Events"].map((category) => `<button type="button" data-category="${category}" aria-pressed="${state.category === category}">${category}</button>`).join("")}</div><label class="sort-control">Sort by <select id="sort-select"><option value="read" ${state.sort === "read" ? "selected" : ""}>Most read</option><option value="rising" ${state.sort === "rising" ? "selected" : ""}>Fastest rising</option><option value="name" ${state.sort === "name" ? "selected" : ""}>A–Z</option></select></label></div>
      <div class="results-heading"><h2 id="result-count" role="status" aria-live="polite"></h2><div class="results-tools"><p>Views · most recent 30 cached days</p><div class="layout-switch" role="group" aria-label="Subject layout"><button type="button" data-layout-choice="grid" aria-label="Grid view" title="Grid view" aria-pressed="${state.layout === "grid"}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><rect x="4" y="4" width="6" height="6" rx=".5" /><rect x="14" y="4" width="6" height="6" rx=".5" /><rect x="4" y="14" width="6" height="6" rx=".5" /><rect x="14" y="14" width="6" height="6" rx=".5" /></svg></button><button type="button" data-layout-choice="list" aria-label="List view" title="List view" aria-pressed="${state.layout === "list"}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 6h2m4 0h10M4 12h2m4 0h10M4 18h2m4 0h10" /></svg></button></div></div></div><div id="results" class="browse-layout"></div>
      <div class="list-caption"><span>Percent changes compare two complete 30-day windows. Sparklines use each subject’s own scale.</span><a href="#/stories/reading-the-pulse">How to read this data</a></div>`;
    renderResults();
    const input = document.getElementById("search-input");
    input.addEventListener("input", () => {
      state.query = input.value;
      renderResults();
    });
    document
      .getElementById("subject-search")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        document.getElementById("results").querySelector("a")?.focus();
      });
    document
      .getElementById("sort-select")
      .addEventListener("change", (event) => {
        state.sort = event.target.value;
        renderResults();
      });
  }

  function setLayout(layout) {
    if (!["list", "grid", "split"].includes(layout)) return;
    state.layout = layout;
    document.getElementById("layout-setting").value = layout;
    document.querySelectorAll("[data-layout-choice]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.layoutChoice === layout),
      );
    });
    if (state.route.view === "explore") renderResults();
  }

  function chartMarkup(subject, secondary) {
    const points = model.series(subject, state.period, snapshot.through);
    const comparison = secondary
      ? model.series(secondary, state.period, snapshot.through)
      : [];
    const maximum = Math.max(
      1,
      ...points.map((point) => point.views ?? 0),
      ...comparison.map((point) => point.views ?? 0),
    );
    const power = Math.pow(10, Math.floor(Math.log10(maximum)));
    const top = Math.ceil(maximum / power) * power;
    const pathFor = (values, className) => {
      let path = "",
        connected = false;
      const dots = [];
      values.forEach((point, index) => {
        if (point.views === null) {
          connected = false;
          return;
        }
        const x = 4 + (index / Math.max(1, values.length - 1)) * 892;
        const y = 230 - (point.views / top) * 220;
        path += `${connected ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)} `;
        if (
          (values[index - 1]?.views ?? null) === null &&
          (values[index + 1]?.views ?? null) === null
        )
          dots.push(
            `<circle cx="${x}" cy="${y}" r="3" fill="${className ? "var(--slate)" : "var(--green)"}" />`,
          );
        connected = true;
      });
      return `<path class="chart-line ${className}" d="${path}" />${dots.join("")}`;
    };
    const total = points.reduce((sum, point) => sum + (point.views ?? 0), 0);
    const recorded = points.filter((point) => point.views !== null).length;
    const secondTotal = comparison.reduce(
      (sum, point) => sum + (point.views ?? 0),
      0,
    );
    return `<div class="chart-summary"><div><div class="metric">${number(total)}</div><p class="metric-label">${secondary ? esc(subject.title) + " · " : ""}views across ${recorded} recorded days</p></div>${secondary ? `<div><div class="metric">${number(secondTotal)}</div><p class="metric-label">${esc(secondary.title)} · recorded views</p></div>` : ""}</div>
      <div class="legend"><span><i></i>${esc(subject.title)}</span>${secondary ? `<span class="comparison"><i></i>${esc(secondary.title)}</span>` : ""}</div>
      <div class="chart-wrap"><div class="y-axis" aria-hidden="true"><span>${shortNumber(top)}</span><span>${shortNumber(top / 2)}</span><span>0</span></div><svg class="chart-svg" viewBox="0 0 900 240" preserveAspectRatio="none" role="img" aria-label="Daily Wikipedia pageviews for ${esc(subject.title)}${secondary ? ` and ${esc(secondary.title)}` : ""}. ${number(total)} recorded primary views; daily figures are available below."><path class="chart-grid" d="M0 10H900 M0 120H900 M0 230H900"/>${pathFor(points, "")}${secondary ? pathFor(comparison, "secondary") : ""}</svg></div>
      <div class="x-axis" aria-hidden="true"><span>${date(points[0].date)}</span><span>${date(points[Math.floor(points.length / 2)].date)}</span><span>${date(points[points.length - 1].date)}</span></div>
      <p class="chart-note">${date(points[0].date)} – ${date(points[points.length - 1].date)} · Daily pageviews. Missing records appear as gaps. Attention is not a measure of historical importance.</p>
      <details class="daily-table"><summary>Read the daily figures</summary><div class="table-scroll" id="daily-table-content"></div></details>`;
  }

  function refreshChart() {
    const subject = find(state.route.slug);
    if (!subject) return;
    const secondary = state.comparing ? find(state.comparisonSlug) : undefined;
    document.getElementById("chart-content").innerHTML = chartMarkup(
      subject,
      secondary,
    );
    document
      .querySelectorAll("[data-period]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.period) === state.period),
        ),
      );
    document
      .querySelector(".daily-table")
      .addEventListener("toggle", (event) => {
        if (!event.currentTarget.open) return;
        const points = model.series(subject, state.period, snapshot.through);
        const comparison = secondary
          ? model.series(secondary, state.period, snapshot.through)
          : [];
        document.getElementById("daily-table-content").innerHTML =
          `<table><caption>Daily pageviews · a dash means no cached record.</caption><thead><tr><th scope="col">Date</th><th scope="col">${esc(subject.title)}</th>${secondary ? `<th scope="col">${esc(secondary.title)}</th>` : ""}</tr></thead><tbody>${points.map((point, index) => `<tr><th scope="row">${date(point.date)}</th><td>${point.views === null ? "—" : number(point.views)}</td>${secondary ? `<td>${comparison[index].views === null ? "—" : number(comparison[index].views)}</td>` : ""}</tr>`).join("")}</tbody></table>`;
      });
  }

  function comparisonControl(subject) {
    return state.comparing
      ? `<div class="comparison-control"><label for="comparison-select">Compare with</label><select id="comparison-select"><option value="">Choose a subject…</option>${snapshot.subjects
          .filter((candidate) => candidate.slug !== subject.slug)
          .map(
            (candidate) =>
              `<option value="${esc(candidate.slug)}" ${state.comparisonSlug === candidate.slug ? "selected" : ""}>${esc(candidate.title)}</option>`,
          )
          .join(
            "",
          )}</select><button class="quiet-button" type="button" data-action="stop-comparison">Remove comparison</button></div>`
      : "";
  }

  function renderTopic() {
    const subject = find(state.route.slug);
    if (!subject)
      return renderMissing("This subject isn’t in the prototype snapshot.");
    document.title = `${subject.title} · History Pulse`;
    const related = snapshot.subjects
      .filter(
        (candidate) =>
          candidate.category === subject.category &&
          candidate.slug !== subject.slug,
      )
      .slice(0, 4);
    main.innerHTML = `<div class="breadcrumb"><a href="#/explore">← Explore</a><span>/</span><span>${subject.category}</span></div>
      <div class="topic-heading"><div><span class="tag">${subject.category}</span><h1>${esc(subject.title)}</h1><p>${esc(subject.description)}</p><a class="article-link" href="https://en.wikipedia.org/wiki/${encodeURIComponent(subject.slug)}" target="_blank" rel="noopener noreferrer">Read on Wikipedia</a></div><div class="topic-actions"><button class="secondary-button" type="button" data-action="compare" aria-pressed="${state.comparing}">Compare</button><button class="primary-button" id="download-button" type="button">Download PNG</button></div></div>
      <section class="chart-panel" aria-labelledby="reading-title"><div class="chart-toolbar"><div><h2 id="reading-title">Reading interest</h2><p>Wikipedia pageviews · cached through ${date(snapshot.through)}</p></div><div class="periods" role="group" aria-label="Chart period">${[
        [30, "30 days"],
        [90, "90 days"],
        [365, "1 year"],
      ]
        .map(
          ([days, label]) =>
            `<button type="button" data-period="${days}" aria-pressed="${state.period === days}">${label}</button>`,
        )
        .join(
          "",
        )}</div></div><div id="comparison-slot">${comparisonControl(subject)}</div><div id="chart-content"></div></section>
      ${related.length ? `<section class="related-block" aria-labelledby="related-title"><h2 id="related-title">More in ${subject.category.toLowerCase()}</h2><div class="related-links">${related.map((candidate) => `<a href="${model.topicHref(candidate.slug)}">${esc(candidate.title)}</a>`).join("")}</div></section>` : ""}
      <a class="reading-link" href="${["Fela_Kuti", "Afrobeat"].includes(subject.slug) ? "#/stories/afrobeat" : "#/stories"}"><div><h2>${["Fela_Kuti", "Afrobeat"].includes(subject.slug) ? "The people behind Afrobeat" : "Want to go deeper?"}</h2><p>Longer reading lives in Stories, separate from the explorer.</p></div></a>`;
    refreshChart();
    attachComparison();
    document
      .getElementById("download-button")
      .addEventListener("click", downloadChart);
  }

  function attachComparison() {
    document
      .getElementById("comparison-select")
      ?.addEventListener("change", (event) => {
        state.comparisonSlug = event.target.value;
        refreshChart();
      });
  }

  function renderStories() {
    document.title = "Stories · The Nigerian History Pulse";
    main.innerHTML = `<div class="page-heading"><div><h1>Stories</h1><p>Historical context, connected subjects, and guides to the data.</p></div><a href="#/explore" class="secondary-button">Back to Explore</a></div>
      <div class="stories-list"><a class="story-card" href="#/stories/afrobeat"><div class="story-mark"><img src="./assets/fela-kuti.jpg" width="46" height="64" alt="" /><p>Culture · 3 connected subjects</p></div><h2>The people behind Afrobeat</h2><p>Start with Fela Kuti, meet Tony Allen, and follow the music that connects them.</p><div class="story-bottom"><span>Explore the story</span></div></a>
      <a class="story-card" href="#/stories/reading-the-pulse"><p class="tag">A guide to the data</p><h2>What does a pulse actually tell us?</h2><p>A short guide to pageviews, time windows, and the difference between attention and importance.</p><div class="story-bottom"><span>Read the guide</span></div></a></div>
      <p class="asset-credit">Portrait: <a href="https://commons.wikimedia.org/wiki/File:Fela_Kuti.jpg" target="_blank" rel="noopener noreferrer">MOI MEME; crop/color by Klausness</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a> · resized and cropped for display.</p>`;
  }

  function renderStory() {
    const afrobeat = state.route.slug === "afrobeat";
    if (!afrobeat && state.route.slug !== "reading-the-pulse")
      return renderMissing("This story isn’t included in the prototype.");
    document.title = `${afrobeat ? "The people behind Afrobeat" : "Reading the Pulse"} · Stories`;
    main.innerHTML = `<article class="story-article"><div class="breadcrumb"><a href="#/stories">← Stories</a></div><span class="tag">${afrobeat ? "Culture · A connected path" : "A guide to the data"}</span><h1>${afrobeat ? "The people behind Afrobeat" : "What does a pulse actually tell us?"}</h1><p class="lede">${afrobeat ? "A musician, a collaborator, and a genre. Follow their connections, then explore their reading history." : "Pageviews show what people opened on Wikipedia. They are a starting point for curiosity, not a verdict on history."}</p>
      ${afrobeat ? `<section class="story-step"><p class="tag">The musician</p><h2>Fela Kuti</h2><p>Fela Kuti was a Nigerian musician, bandleader and political activist, and a principal innovator of Afrobeat.</p><div class="article-actions"><a class="secondary-button" href="${model.topicHref("Fela_Kuti")}">Explore Fela Kuti</a><a class="article-link" href="https://en.wikipedia.org/wiki/Fela_Kuti" target="_blank" rel="noopener noreferrer">Source: Wikipedia</a></div></section><section class="story-step"><p class="tag">The collaborator</p><h2>Tony Allen</h2><p>Allen was the drummer and musical director in Fela’s Africa ’70. Their collaboration is one way into the story of the sound.</p><a class="article-link" href="https://en.wikipedia.org/wiki/Tony_Allen_(musician)" target="_blank" rel="noopener noreferrer">Read Tony Allen’s article and sources</a></section><section class="story-step"><p class="tag">The genre</p><h2>Afrobeat</h2><p>Kuti and Allen helped develop Afrobeat. The genre connects the two musicians and offers another starting point for exploration.</p><div class="article-actions"><a class="secondary-button" href="${model.topicHref("Afrobeat")}">Explore Afrobeat</a><a class="article-link" href="https://en.wikipedia.org/wiki/Afrobeat" target="_blank" rel="noopener noreferrer">Source: Wikipedia</a></div></section><p class="small-text">A short, sourced story specimen for layout review. Longer historical writing can live in this section.</p>` : `<section><h2>Read the window, not just the number.</h2><p>Explore shows the most recent 30 days in this cached snapshot, ending ${date(snapshot.through)}. Changes compare that period with the preceding 30 days, only when both periods are complete and the previous period has at least 50 views. Other cases show recorded-day coverage instead.</p></section><section><h2>A gap is not zero.</h2><p>A missing record means no cached count is available for that date. Charts break the line at those dates. A recorded zero is kept as zero. Open the daily figures to inspect the data directly.</p></section><section><h2>Attention needs context.</h2><p>A peak means more people opened an article. It does not establish the cause, represent public opinion, or measure how historically important the subject is. The chart and Stories serve different purposes.</p></section><section><h2>This is a dated snapshot.</h2><p>The prototype uses twelve subjects from this project’s cached Wikipedia records. It works without a backend and makes no live requests. Its ranking applies to this small collection and date window, not every Nigerian subject on Wikipedia.</p><a class="primary-button" href="#/explore">Explore the records</a></section>`}</article>`;
  }

  function renderMissing(message) {
    main.innerHTML = `<div class="empty-state"><h1>Not in this preview.</h1><p>${esc(message)}</p><a class="primary-button" href="#/explore">Back to Explore</a></div>`;
  }

  async function downloadChart() {
    const button = document.getElementById("download-button");
    button.disabled = true;
    button.textContent = "Preparing…";
    try {
      await document.fonts.ready;
      const subject = find(state.route.slug);
      const secondary = state.comparing
        ? find(state.comparisonSlug)
        : undefined;
      const points = model.series(subject, state.period, snapshot.through);
      const comparison = secondary
        ? model.series(secondary, state.period, snapshot.through)
        : [];
      const canvas = document.createElement("canvas");
      canvas.width = 2400;
      canvas.height = 1480;
      const context = canvas.getContext("2d");
      context.scale(2, 2);
      const palette = getComputedStyle(document.body);
      const color = (name) => palette.getPropertyValue(name).trim();
      context.fillStyle = color("--ground");
      context.fillRect(0, 0, 1200, 740);
      context.fillStyle = color("--green");
      context.font = '500 16px "Noto Sans"';
      context.fillText("THE NIGERIAN HISTORY PULSE", 64, 60);
      context.fillStyle = color("--ink");
      context.font = '600 34px "Noto Sans"';
      let heading = "",
        lineY = 118;
      for (const word of subject.title.split(" ")) {
        if (context.measureText(heading + word).width > 1050 && heading) {
          context.fillText(heading.trim(), 64, lineY);
          heading = "";
          lineY += 44;
        }
        heading += word + " ";
      }
      context.fillText(heading.trim(), 64, lineY);
      context.font = '400 14px "Noto Sans"';
      context.fillStyle = color("--muted");
      context.fillText(
        `Daily Wikipedia pageviews · ${date(points[0].date)} – ${date(snapshot.through)}`,
        64,
        lineY + 36,
      );
      const top = Math.max(
        1,
        ...points.map((point) => point.views ?? 0),
        ...comparison.map((point) => point.views ?? 0),
      );
      const plot = { x: 105, y: lineY + 100, width: 1025, height: 300 };
      context.lineWidth = 1;
      context.strokeStyle = color("--rule");
      context.font = '400 12px "Noto Sans"';
      for (const factor of [0, 0.5, 1]) {
        const y = plot.y + plot.height - factor * plot.height;
        context.beginPath();
        context.moveTo(plot.x, y);
        context.lineTo(plot.x + plot.width, y);
        context.stroke();
        context.fillStyle = color("--muted");
        context.fillText(shortNumber(top * factor), 64, y + 4);
      }
      const draw = (values, stroke, dash) => {
        context.strokeStyle = stroke;
        context.lineWidth = 2;
        context.setLineDash(dash);
        context.beginPath();
        let connected = false;
        values.forEach((point, index) => {
          if (point.views === null) {
            connected = false;
            return;
          }
          const x = plot.x + (index / (values.length - 1)) * plot.width;
          const y = plot.y + plot.height - (point.views / top) * plot.height;
          if (connected) context.lineTo(x, y);
          else context.moveTo(x, y);
          connected = true;
        });
        context.stroke();
        context.setLineDash([]);
      };
      draw(points, color("--green"), []);
      if (secondary) draw(comparison, color("--slate"), [6, 4]);
      context.fillStyle = color("--muted");
      context.fillText(date(points[0].date), plot.x, plot.y + plot.height + 30);
      context.textAlign = "right";
      context.fillText(
        date(snapshot.through),
        plot.x + plot.width,
        plot.y + plot.height + 30,
      );
      context.textAlign = "left";
      context.font = '500 14px "Noto Sans"';
      context.fillStyle = color("--green");
      context.fillText(`${subject.title} · solid line`, 64, 610);
      if (secondary) {
        context.fillStyle = color("--slate");
        context.fillText(`${secondary.title} · dashed line`, 64, 638);
      }
      context.fillStyle = color("--muted");
      context.font = '400 11px "Noto Sans"';
      context.fillText(
        "Source: cached Wikipedia pageviews · gaps are missing records · attention does not establish importance or cause.",
        64,
        688,
      );
      context.fillText(
        "Review prototype · historical snapshot, not live activity",
        64,
        710,
      );
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("No image produced");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${subject.slug}-pulse.png`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast("PNG prepared with the selected period and cached-data label.");
    } catch {
      toast("The image couldn’t be prepared. Please try again.");
    } finally {
      button.disabled = false;
      button.textContent = "Download PNG";
    }
  }

  function renderRoute() {
    if (!snapshot?.subjects?.length || !model) {
      renderMissing(
        "The local dataset failed to load. Refresh this page or check the prototype files.",
      );
      return;
    }
    const route = model.readRoute(window.location.hash);
    if (route.view === "topic" && route.slug !== state.route.slug) {
      state.comparing = false;
      state.comparisonSlug = "";
      state.period = 30;
    }
    state.route = route;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const current =
        link.dataset.nav ===
        (route.view === "stories" || route.view === "story"
          ? "stories"
          : "explore");
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (route.view === "explore") renderExplore();
    else if (route.view === "topic") renderTopic();
    else if (route.view === "stories") renderStories();
    else if (route.view === "story") renderStory();
    else renderMissing("This link could not be read.");
  }

  main.addEventListener("click", (event) => {
    const layout = event.target.closest("[data-layout-choice]");
    if (layout) {
      setLayout(layout.dataset.layoutChoice);
      return;
    }
    const category = event.target.closest("[data-category]");
    if (category) {
      state.category = category.dataset.category;
      renderResults();
      return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "clear") {
      state.query = "";
      state.category = "All subjects";
      renderExplore();
      document.getElementById("search-input").focus();
    }
    if (action === "retry") {
      state.dataState = "ready";
      document.getElementById("state-setting").value = "ready";
      renderResults();
    }
    if (action === "compare" || action === "stop-comparison") {
      state.comparing = action === "compare" ? !state.comparing : false;
      if (!state.comparing) state.comparisonSlug = "";
      renderTopic();
      if (state.comparing)
        document.getElementById("comparison-select")?.focus();
      else document.querySelector('[data-action="compare"]')?.focus();
    }
    const period = event.target.closest("[data-period]");
    if (period) {
      state.period = Number(period.dataset.period);
      refreshChart();
    }
    const subject = event.target.closest("[data-subject]");
    if (
      subject &&
      state.layout === "split" &&
      window.matchMedia("(min-width: 701px)").matches &&
      !event.button &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      state.preview = subject.dataset.subject;
      document.querySelectorAll("[data-subject]").forEach((link) => {
        if (link.dataset.subject === state.preview)
          link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      document.querySelector(".preview-card").innerHTML = previewCard(
        find(state.preview),
      );
    }
  });

  window.addEventListener("hashchange", () => {
    renderRoute();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  document.querySelector(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    window.scrollTo({
      top: main.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    });
  });
  document.getElementById("theme-button").addEventListener("click", (event) => {
    const night = document.documentElement.dataset.theme !== "night";
    document.documentElement.dataset.theme = night ? "night" : "paper";
    event.currentTarget.textContent = night ? "Paper" : "Night";
    event.currentTarget.setAttribute(
      "aria-label",
      `Switch to ${night ? "paper" : "night"} mode`,
    );
    document.querySelector('meta[name="theme-color"]').content = night
      ? "#18231d"
      : "#f8faf7";
  });
  const panel = document.getElementById("tweaks-panel");
  const toggle = document.getElementById("tweaks-button");
  function setTweaks(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) document.getElementById("close-tweaks").focus();
  }
  toggle.addEventListener("click", () => setTweaks(panel.hidden));
  document.getElementById("close-tweaks").addEventListener("click", () => {
    setTweaks(false);
    toggle.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setTweaks(false);
      toggle.focus();
    }
  });
  document
    .getElementById("layout-setting")
    .addEventListener("change", (event) => {
      setLayout(event.target.value);
    });
  document
    .getElementById("density-setting")
    .addEventListener("change", (event) => {
      state.density = event.target.value;
      document.body.dataset.density = state.density;
    });
  document
    .getElementById("state-setting")
    .addEventListener("change", (event) => {
      state.dataState = event.target.value;
      if (state.route.view === "explore") renderResults();
    });
  if (!snapshot?.subjects?.length || !model) {
    renderMissing(
      "The local dataset failed to load. Refresh this page or check the prototype files.",
    );
    return;
  }
  renderRoute();
})();
