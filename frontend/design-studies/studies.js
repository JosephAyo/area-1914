const directionNames = {
  edition: "A / Editorial edition",
  collection: "B / Collection plate",
};

function setDirection(direction) {
  if (!Object.hasOwn(directionNames, direction)) return;
  document.body.dataset.study = direction;
  document.querySelector("#direction-name").textContent =
    directionNames[direction];
  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.direction === direction),
    );
  });
}

function setScreen(screen, moveFocus = false) {
  if (screen !== "home" && screen !== "topic") return;
  document.body.dataset.screen = screen;
  document.querySelector(".home-view").hidden = screen !== "home";
  document.querySelector(".topic-view").hidden = screen !== "topic";
  document.querySelectorAll("button[data-view]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.view === screen));
  });
  if (moveFocus) document.querySelector("#content").focus();
}

document.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () =>
    setDirection(button.dataset.direction),
  );
});

document.querySelectorAll("[data-view]").forEach((control) => {
  control.addEventListener("click", (event) => {
    if (
      event.button > 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (control.tagName === "A") return; // Anchor navigation is handled by hashchange.
    window.location.hash = control.dataset.view;
  });
});

function readScreen() {
  const hash = window.location.hash;
  if (hash === "#home" || hash === "#thread") setScreen("home");
  else if (
    hash === "#topic" ||
    hash === "#reading-history" ||
    hash === "#record-thread"
  )
    setScreen("topic");
}

window.addEventListener("hashchange", () => {
  readScreen();
  const hash = window.location.hash;
  if (hash === "#home" || hash === "#topic") {
    document.querySelector("#content").focus();
  } else {
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }
});

document.querySelector("#hide-image").addEventListener("change", (event) => {
  document.body.classList.toggle("no-image", event.target.checked);
});

document.querySelectorAll(".portrait img").forEach((image) => {
  const handleFailure = () =>
    image.closest(".portrait").classList.add("image-failed");
  image.addEventListener("error", handleFailure);
  if (image.complete && image.naturalWidth === 0) handleFailure();
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = document.querySelector("#subject-search").value.trim();
  if (!value) return;
  window.location.assign(
    `/topics/${encodeURIComponent(value.replace(/\s+/g, "_"))}`,
  );
});

readScreen();
