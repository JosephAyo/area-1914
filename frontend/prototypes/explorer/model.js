/* Pure data operations shared by the prototype and its local checks. */
(() => {
  const DAY = 86_400_000;
  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function series(subject, days, through) {
    const end = Date.parse(through);
    const byDate = new Map(
      subject.pageviews.map((point) => [point.date, point.views]),
    );
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(end - (days - index - 1) * DAY)
        .toISOString()
        .slice(0, 10);
      return { date, views: byDate.get(date) ?? null };
    });
  }
  function stats(subject, through) {
    const points = series(subject, 60, through);
    const previous = points
      .slice(0, 30)
      .filter((point) => point.views !== null);
    const current = points.slice(30).filter((point) => point.views !== null);
    const total = current.reduce((sum, point) => sum + point.views, 0);
    const previousTotal = previous.reduce((sum, point) => sum + point.views, 0);
    return {
      total,
      recordedDays: current.length,
      previousDays: previous.length,
      previousTotal,
      growth:
        previousTotal >= 50 && previous.length === 30 && current.length === 30
          ? ((total - previousTotal) / previousTotal) * 100
          : null,
    };
  }
  function filterSubjects(
    subjects,
    { query = "", category = "All subjects", sort = "read" },
    through,
  ) {
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
    return subjects
      .filter(
        (subject) =>
          (category === "All subjects" || subject.category === category) &&
          terms.every((term) =>
            normalize(
              `${subject.title} ${subject.description} ${subject.category}`,
            ).includes(term),
          ),
      )
      .sort((a, b) => {
        if (sort === "name") return a.title.localeCompare(b.title);
        if (sort === "rising")
          return (
            (stats(b, through).growth ?? -Infinity) -
              (stats(a, through).growth ?? -Infinity) ||
            a.title.localeCompare(b.title)
          );
        return (
          stats(b, through).total - stats(a, through).total ||
          a.title.localeCompare(b.title)
        );
      });
  }
  function readRoute(hash) {
    const parts = hash.replace(/^#\/?/, "").split("/");
    if (parts[0] === "topics" && parts[1]) {
      try {
        return {
          view: "topic",
          slug: decodeURIComponent(parts.slice(1).join("/")),
        };
      } catch {
        return { view: "missing" };
      }
    }
    if (parts[0] === "stories")
      return { view: parts[1] ? "story" : "stories", slug: parts[1] };
    return { view: "explore" };
  }
  const topicHref = (slug) => `#/topics/${encodeURIComponent(slug)}`;
  window.ExplorerModel = {
    normalize,
    series,
    stats,
    filterSubjects,
    readRoute,
    topicHref,
  };
})();
