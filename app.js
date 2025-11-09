const state = {
  filter: "all",
  activeTag: null,
  searchQuery: "",
  news: [],
  research: [],
  models: [],
  videos: [],
  social: [],
  combined: [],
};

const dom = {
  newsFeed: document.getElementById("news-feed"),
  researchFeed: document.getElementById("research-feed"),
  modelsGrid: document.getElementById("models-grid"),
  videosFeed: document.getElementById("videos-feed"),
  socialFeed: document.getElementById("social-feed"),
  newsCount: document.getElementById("news-count"),
  researchCount: document.getElementById("research-count"),
  modelsCount: document.getElementById("models-count"),
  videosCount: document.getElementById("videos-count"),
  socialCount: document.getElementById("social-count"),
  filterChips: document.querySelectorAll(".filter-chip"),
  panels: document.querySelectorAll("[data-panel]"),
  tagFilters: document.getElementById("tag-filters"),
  activeTag: document.getElementById("active-tag"),
  streamCount: document.getElementById("stream-count"),
  lastSync: document.getElementById("last-sync"),
  searchTrigger: document.getElementById("search-trigger"),
  palette: document.getElementById("command-palette"),
  paletteInput: document.getElementById("palette-input"),
  paletteResults: document.getElementById("palette-results"),
  paletteClose: document.getElementById("palette-close"),
  utcClock: document.getElementById("utc-clock"),
  latencyReadout: document.getElementById("latency-readout"),
};

document.addEventListener("DOMContentLoaded", () => {
  hydrateClock();
  hydrateLatency();
  loadStreams();
  bindFilterControls();
  bindCommandPalette();
});

async function loadStreams() {
  try {
    const [news, research, models, videos, social] = await Promise.all([
      fetchJSON("./data/news.json"),
      fetchJSON("./data/research.json"),
      fetchJSON("./data/models.json"),
      fetchJSON("./data/videos.json"),
      fetchJSON("./data/social.json"),
    ]);

    state.news = news;
    state.research = research;
    state.models = models;
    state.videos = videos;
    state.social = social;
    state.combined = combineStreams(news, research, models, videos, social);

    renderFeeds();
    renderTagFilters();
    updateStats();
  } catch (error) {
    const msg = `<div class="empty-state">
      <strong>Stream offline</strong>
      <p>${error.message}</p>
    </div>`;
    dom.newsFeed.innerHTML = msg;
    dom.researchFeed.innerHTML = msg;
    dom.modelsGrid.innerHTML = msg;
    dom.videosFeed.innerHTML = msg;
    dom.socialFeed.innerHTML = msg;
  }
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

function renderFeeds() {
  renderNews();
  renderResearch();
  renderModels();
  renderVideos();
  renderSocial();
  renderPaletteResults();
}

function renderNews() {
  const filtered = applyTag(state.news);
  dom.newsCount.textContent = `${filtered.length} briefs`;
  if (!filtered.length) {
    dom.newsFeed.innerHTML =
      '<p class="panel-empty">No news matches that tag.</p>';
    return;
  }
  dom.newsFeed.innerHTML = filtered
    .map(
      (item) => `
        <article class="news-card">
          <div class="card-headline">
            <a href="${item.link}" target="_blank" rel="noopener">
              ${item.title}
            </a>
            <span>${formatRelative(item.timestamp)}</span>
          </div>
          <p class="card-meta">
            <span>${item.source}</span>
            <span>•</span>
            <span>${item.region}</span>
          </p>
          <p>${item.summary}</p>
          <div class="tags-row">
            ${item.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderResearch() {
  const filtered = applyTag(state.research);
  dom.researchCount.textContent = `${filtered.length} drops`;
  if (!filtered.length) {
    dom.researchFeed.innerHTML =
      '<p class="panel-empty">No research items for this tag.</p>';
    return;
  }
  dom.researchFeed.innerHTML = filtered
    .map(
      (item) => `
        <article class="research-card">
          <div class="card-headline">
            <a href="${item.link}" target="_blank" rel="noopener">
              ${item.title}
            </a>
            <span>${formatRelative(item.timestamp)}</span>
          </div>
          <p class="card-meta">
            <span>${item.authors.join(", ")}</span>
            <span>•</span>
            <span>${item.organization}</span>
          </p>
          <p>${item.abstract}</p>
          <div class="tags-row">
            ${item.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderModels() {
  const filtered = applyTag(state.models);
  dom.modelsCount.textContent = `${filtered.length} tracked`;
  if (!filtered.length) {
    dom.modelsGrid.innerHTML =
      '<p class="panel-empty">No models match this focus tag.</p>';
    return;
  }

  dom.modelsGrid.innerHTML = filtered
    .map((model) => {
      const modalities = model.modalities.join(" / ");
      const tags = model.domains || [];
      return `
        <article class="model-card">
          <div class="model-header">
            <div>
              <a href="${model.link}" target="_blank" rel="noopener">
                <h3>${model.name}</h3>
              </a>
              <div class="model-meta">
                <span>${model.provider}</span>
                <span>${modalities}</span>
              </div>
            </div>
            <span class="model-pill">${model.params}</span>
          </div>
          <div class="model-metrics">
            <div class="model-metric">
              <label>Context</label>
              <strong>${model.context}</strong>
            </div>
            <div class="model-metric">
              <label>MMLU</label>
              <strong>${model.benchmarks.mmlu}%</strong>
            </div>
            <div class="model-metric">
              <label>Efficiency</label>
              <strong>${model.efficiency}</strong>
            </div>
            <div class="model-metric">
              <label>Updated</label>
              <strong>${formatRelative(model.timestamp)}</strong>
            </div>
          </div>
          <div class="model-tags">
            ${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderVideos() {
  const filtered = applyTag(state.videos);
  dom.videosCount.textContent = `${filtered.length} videos`;
  if (!filtered.length) {
    dom.videosFeed.innerHTML =
      '<p class="panel-empty">No explainers tagged like that.</p>';
    return;
  }

  dom.videosFeed.innerHTML = filtered
    .map(
      (video) => `
        <article class="video-card">
          <header>
            <a href="${video.link}" target="_blank" rel="noopener">
              ${video.title}
            </a>
            <span>${formatRelative(video.timestamp)}</span>
          </header>
          <p class="video-meta">
            <span>${video.channel}</span>
            <span>•</span>
            <span>${video.duration}</span>
          </p>
          <p>${video.summary}</p>
          <div class="tags-row">
            ${video.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderSocial() {
  const filtered = applyTag(state.social);
  dom.socialCount.textContent = `${filtered.length} posts`;
  if (!filtered.length) {
    dom.socialFeed.innerHTML =
      '<p class="panel-empty">No trending posts for that filter.</p>';
    return;
  }

  dom.socialFeed.innerHTML = filtered
    .map(
      (post) => `
        <article class="social-card">
          <header>
            <a href="${post.link}" target="_blank" rel="noopener">
              @${post.handle}
            </a>
            <span>${formatRelative(post.timestamp)}</span>
          </header>
          <p class="social-meta">
            <span>${post.author}</span>
            <span>•</span>
            <span>${post.stats.likes} likes</span>
            <span>•</span>
            <span>${post.stats.reposts} reposts</span>
          </p>
          <p class="social-content">${post.content}</p>
          <div class="tags-row">
            ${post.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderTagFilters() {
  const tagSet = new Set();
  const collections = [
    state.news,
    state.research,
    state.videos,
    state.social,
    state.models,
  ];

  collections.forEach((collection) =>
    collection.forEach((item) => {
      const tags = item.tags || item.domains || [];
      tags.forEach((tag) => tagSet.add(tag));
    })
  );

  dom.tagFilters.innerHTML = Array.from(tagSet)
    .slice(0, 10)
    .map(
      (tag) => `
      <button class="tag-pill ${state.activeTag === tag ? "active" : ""}" 
        data-tag="${tag}">
        ${tag}
      </button>`
    )
    .join("");

  dom.tagFilters.querySelectorAll(".tag-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      state.activeTag = state.activeTag === tag ? null : tag;
      dom.activeTag.textContent = state.activeTag ?? "None";
      renderTagFilters();
      renderFeeds();
    });
  });
}

function applyTag(collection) {
  if (!state.activeTag) return collection;
  return collection.filter((item) =>
    (item.tags || item.domains || []).includes(state.activeTag)
  );
}

function bindFilterControls() {
  dom.filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.filter = chip.dataset.filter;
      dom.filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      updatePanelVisibility();
    });
  });
}

function updatePanelVisibility() {
  dom.panels.forEach((panel) => {
    if (state.filter === "all") {
      panel.classList.remove("muted");
      return;
    }

    if (panel.dataset.panel === state.filter) {
      panel.classList.remove("muted");
    } else {
      panel.classList.add("muted");
    }
  });
}

function updateStats() {
  const total =
    state.news.length +
    state.research.length +
    state.models.length +
    state.videos.length +
    state.social.length;
  dom.streamCount.textContent = total;

  const latestTimestamp = [
    ...state.news,
    ...state.research,
    ...state.videos,
    ...state.social,
    ...state.models,
  ]
    .map((item) => new Date(item.timestamp))
    .sort((a, b) => b - a)[0];

  if (latestTimestamp) {
    dom.lastSync.textContent = formatAbsolute(latestTimestamp);
  }
}

function bindCommandPalette() {
  const openPalette = () => {
    dom.palette.classList.add("open");
    dom.palette.setAttribute("aria-hidden", "false");
    dom.paletteInput.focus();
  };

  const closePalette = () => {
    dom.palette.classList.remove("open");
    dom.palette.setAttribute("aria-hidden", "true");
    dom.paletteInput.value = "";
    state.searchQuery = "";
    renderPaletteResults();
    dom.searchTrigger.focus();
  };

  dom.searchTrigger.addEventListener("click", openPalette);
  dom.paletteClose.addEventListener("click", closePalette);

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPalette();
    }

    if (event.key === "Escape" && dom.palette.classList.contains("open")) {
      closePalette();
    }
  });

  dom.paletteInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    renderPaletteResults();
  });
}

function renderPaletteResults() {
  const query = state.searchQuery;
  let entries = state.combined;

  if (query.length) {
    entries = entries.filter((entry) => {
      const haystack = `${entry.title} ${entry.summary ?? ""} ${
        entry.tags?.join(" ") ?? ""
      }`.toLowerCase();
      return haystack.includes(query);
    });
  }

  dom.paletteResults.innerHTML = entries.length
    ? entries
        .map(
          (entry) => `
    <a class="palette-item" href="${entry.link}" target="_blank" rel="noopener">
      <div>
        <span class="palette-item-type">${entry.type}</span>
        <p class="palette-item-title">${entry.title}</p>
        <p class="palette-item-meta">
          ${entry.subtitle ?? entry.source ?? entry.provider ?? ""}
        </p>
      </div>
      <span>${formatRelative(entry.timestamp)}</span>
    </a>`
        )
        .join("")
    : '<p class="panel-empty">No signals found. Try a broader query.</p>';
}

function combineStreams(news, research, models, videos, social) {
  return [
    ...news.map((item) => ({
      ...item,
      type: "NEWS",
      subtitle: item.source,
    })),
    ...research.map((item) => ({
      ...item,
      type: "RESEARCH",
      subtitle: item.organization,
    })),
    ...models.map((item) => ({
      title: `${item.name} (${item.provider})`,
      summary: `${item.params} · ${item.context} context · ${item.modalities.join(
        "/"
      )}`,
      tags: item.domains,
      type: "MODEL",
      link: item.link,
      timestamp: item.timestamp,
      subtitle: `${item.params} @ ${item.efficiency}`,
    })),
    ...videos.map((item) => ({
      ...item,
      type: "VIDEO",
      subtitle: `${item.channel} • ${item.duration}`,
    })),
    ...social.map((item) => ({
      title: `${item.author} (@${item.handle})`,
      summary: item.content,
      tags: item.tags,
      type: "SOCIAL",
      link: item.link,
      timestamp: item.timestamp,
      subtitle: `${item.stats.likes} likes · ${item.stats.reposts} reposts`,
    })),
  ];
}

function hydrateClock() {
  const tick = () => {
    const now = new Date();
    const hours = now.getUTCHours().toString().padStart(2, "0");
    const minutes = now.getUTCMinutes().toString().padStart(2, "0");
    dom.utcClock.textContent = `${hours}:${minutes} UTC`;
  };
  tick();
  setInterval(tick, 1000 * 60);
}

function hydrateLatency() {
  const roll = () => {
    const latency = Math.floor(20 + Math.random() * 15);
    dom.latencyReadout.textContent = `${latency}ms`;
  };
  roll();
  setInterval(roll, 4000);
}

function formatRelative(timestamp) {
  const delta = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatAbsolute(date) {
  return date.toLocaleString("en-GB", {
    hour12: false,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
