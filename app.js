/* ===== APP.JS — Tanzaflix interactive logic ===== */

(function () {
  "use strict";

  // ---------- State ----------
  let watchlist = JSON.parse(localStorage.getItem("tz_watchlist") || "[]");
  let searchQuery = "";

  // ---------- DOM refs ----------
  const navbar = document.getElementById("navbar");
  const heroSection = document.getElementById("hero");
  const rowsSection = document.getElementById("rows-section");
  const searchResultsSection = document.getElementById("search-results");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchToggleBtn = document.getElementById("search-toggle");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalEl = document.getElementById("modal");
  const toast = document.getElementById("toast");

  // ---------- Helpers ----------
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function starScore(score) {
    return "⭐ " + score.toFixed(1);
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function isInWatchlist(id) {
    return watchlist.includes(id);
  }

  function saveWatchlist() {
    localStorage.setItem("tz_watchlist", JSON.stringify(watchlist));
  }

  function toggleWatchlist(id, btnEl) {
    const idx = watchlist.indexOf(id);
    if (idx === -1) {
      watchlist.push(id);
      showToast("Added to My List");
    } else {
      watchlist.splice(idx, 1);
      showToast("Removed from My List");
    }
    saveWatchlist();
    // Update all buttons with this movie id
    document.querySelectorAll(`[data-wl="${id}"]`).forEach((btn) => {
      btn.classList.toggle("watchlist-added", watchlist.includes(id));
      btn.setAttribute("title", watchlist.includes(id) ? "Remove from My List" : "Add to My List");
      btn.textContent = watchlist.includes(id) ? "✓" : "+";
    });
  }

  // ---------- Render helpers ----------
  function buildCardActions(movie) {
    const inWl = isInWatchlist(movie.id);
    return `
      <div class="movie-card-actions">
        <button class="card-btn play" title="Play" data-play="${movie.id}">▶</button>
        <button class="card-btn ${inWl ? "watchlist-added" : ""}" title="${inWl ? "Remove from My List" : "Add to My List"}" data-wl="${movie.id}">${inWl ? "✓" : "+"}</button>
        <button class="card-btn" title="More info" data-info="${movie.id}">ⓘ</button>
      </div>
    `;
  }

  function buildCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.id = movie.id;
    card.innerHTML = `
      <img class="movie-card-thumb" src="${escapeHtml(movie.thumbnail)}" alt="${escapeHtml(movie.title)}" loading="lazy" />
      <div class="movie-card-info">
        ${buildCardActions(movie)}
        <div class="movie-card-title">${escapeHtml(movie.title)}</div>
        <div class="movie-card-meta">
          <span class="movie-card-score">${starScore(movie.score)}</span>
          <span>${escapeHtml(movie.year.toString())}</span>
          <span class="rating-tag">${escapeHtml(movie.rating)}</span>
        </div>
      </div>
    `;
    return card;
  }

  function buildRow(title, movies) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="row-header">
        <h2 class="row-title">${escapeHtml(title)}</h2>
        <a href="#" class="row-see-all" role="button">See all</a>
      </div>
      <div class="cards-track-wrapper">
        <button class="scroll-btn left" aria-label="Scroll left">&#8249;</button>
        <div class="cards-track"></div>
        <button class="scroll-btn right" aria-label="Scroll right">&#8250;</button>
      </div>
    `;

    const track = row.querySelector(".cards-track");
    movies.forEach((m) => track.appendChild(buildCard(m)));

    // Scroll buttons
    const leftBtn = row.querySelector(".scroll-btn.left");
    const rightBtn = row.querySelector(".scroll-btn.right");
    leftBtn.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.8, behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
    });

    return row;
  }

  // ---------- Render rows ----------
  function renderRows() {
    rowsSection.innerHTML = "";
    const sections = [
      { title: "🔥 Trending Now", movies: MOVIES.trending },
      { title: "🆕 New Releases", movies: MOVIES.newReleases },
      { title: "⭐ Top Rated", movies: MOVIES.topRated },
      { title: "🌍 African Cinema", movies: MOVIES.africanCinema },
    ];
    sections.forEach(({ title, movies }) => {
      rowsSection.appendChild(buildRow(title, movies));
    });
  }

  // ---------- Hero ----------
  function renderHero() {
    const m = HERO_MOVIE;
    document.getElementById("hero-img").src = m.banner;
    document.getElementById("hero-img").alt = m.title;
    document.getElementById("hero-title").textContent = m.title;
    document.getElementById("hero-year").textContent = m.year;
    document.getElementById("hero-rating").textContent = m.rating;
    document.getElementById("hero-score").textContent = starScore(m.score);
    document.getElementById("hero-duration").textContent = m.duration;
    document.getElementById("hero-desc").textContent = m.description;

    document.getElementById("hero-play").addEventListener("click", () => {
      showToast(`▶ Playing "${m.title}" …`);
    });
    document.getElementById("hero-info").addEventListener("click", () => {
      openModal(m);
    });
  }

  // ---------- Modal ----------
  function openModal(movie) {
    document.getElementById("modal-banner").src = movie.banner;
    document.getElementById("modal-banner").alt = movie.title;
    document.getElementById("modal-title").textContent = movie.title;
    document.getElementById("modal-score").textContent = starScore(movie.score);
    document.getElementById("modal-rating").textContent = movie.rating;
    document.getElementById("modal-year").textContent = movie.year;
    document.getElementById("modal-duration").textContent = movie.duration;
    document.getElementById("modal-desc").textContent = movie.description;

    const genresEl = document.getElementById("modal-genres");
    genresEl.innerHTML = movie.genres
      .map((g) => `<span class="genre-tag">${escapeHtml(g)}</span>`)
      .join("");

    const inWl = isInWatchlist(movie.id);
    const wlBtn = document.getElementById("modal-watchlist");
    wlBtn.dataset.wl = movie.id;
    wlBtn.className = `btn btn-secondary${inWl ? " watchlist-added" : ""}`;
    wlBtn.textContent = inWl ? "✓ In My List" : "+ My List";

    const playBtn = document.getElementById("modal-play");
    playBtn.onclick = () => {
      closeModal();
      showToast(`▶ Playing "${movie.title}" …`);
    };

    wlBtn.onclick = () => {
      toggleWatchlist(movie.id, wlBtn);
      const now = isInWatchlist(movie.id);
      wlBtn.className = `btn btn-secondary${now ? " watchlist-added" : ""}`;
      wlBtn.textContent = now ? "✓ In My List" : "+ My List";
    };

    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // ---------- Search ----------
  function getAllMovies() {
    return [
      ...MOVIES.trending,
      ...MOVIES.newReleases,
      ...MOVIES.topRated,
      ...MOVIES.africanCinema,
    ];
  }

  function renderSearchResults(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      searchResultsSection.classList.add("hidden");
      heroSection.classList.remove("hidden");
      rowsSection.classList.remove("hidden");
      return;
    }

    const results = getAllMovies().filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q) ||
        m.year.toString().includes(q)
    );

    heroSection.classList.add("hidden");
    rowsSection.classList.add("hidden");
    searchResultsSection.classList.remove("hidden");

    const heading = searchResultsSection.querySelector(".search-heading");
    heading.textContent =
      results.length > 0
        ? `Results for "${query}" (${results.length})`
        : `No results for "${query}"`;

    const grid = searchResultsSection.querySelector(".search-grid");
    grid.innerHTML = "";
    results.forEach((m) => grid.appendChild(buildCard(m)));
  }

  // ---------- Event delegation ----------
  document.body.addEventListener("click", (e) => {
    // Play button on card
    const playTarget = e.target.closest("[data-play]");
    if (playTarget) {
      e.stopPropagation();
      const id = parseInt(playTarget.dataset.play, 10);
      const movie = getAllMovies().find((m) => m.id === id);
      if (movie) showToast(`▶ Playing "${movie.title}" …`);
      return;
    }

    // Watchlist button on card
    const wlTarget = e.target.closest("[data-wl]");
    if (wlTarget && !wlTarget.closest(".modal")) {
      e.stopPropagation();
      const id = parseInt(wlTarget.dataset.wl, 10);
      toggleWatchlist(id, wlTarget);
      return;
    }

    // Info button on card
    const infoTarget = e.target.closest("[data-info]");
    if (infoTarget) {
      e.stopPropagation();
      const id = parseInt(infoTarget.dataset.info, 10);
      const movie = getAllMovies().find((m) => m.id === id);
      if (movie) openModal(movie);
      return;
    }

    // Click on card itself (not a button)
    const cardTarget = e.target.closest(".movie-card");
    if (cardTarget && !e.target.closest("button")) {
      const id = parseInt(cardTarget.dataset.id, 10);
      const movie = getAllMovies().find((m) => m.id === id);
      if (movie) openModal(movie);
      return;
    }

    // Close modal on overlay click
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Modal close button
  document.getElementById("modal-close").addEventListener("click", closeModal);

  // Escape key closes modal / clears search
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalOverlay.classList.contains("active")) {
        closeModal();
      } else if (searchForm.classList.contains("open")) {
        searchInput.value = "";
        searchForm.classList.remove("open");
        renderSearchResults("");
      }
    }
  });

  // ---------- Search toggle ----------
  searchToggleBtn.addEventListener("click", () => {
    searchForm.classList.toggle("open");
    if (searchForm.classList.contains("open")) {
      searchInput.focus();
    } else {
      searchInput.value = "";
      renderSearchResults("");
    }
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    renderSearchResults(searchQuery);
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    renderSearchResults(searchInput.value);
  });

  // ---------- Navbar scroll effect ----------
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });

  // ---------- Init ----------
  renderHero();
  renderRows();
})();
