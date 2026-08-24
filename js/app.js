const POSTER_INTERVAL = 4000;
const PAGE_REFRESH_INTERVAL = 10000;
const THEME_KEY = "badriya-display-theme";

const posterImage = document.getElementById("posterImage");
const posterLoading = document.getElementById("posterLoading");
const posterEmpty = document.getElementById("posterEmpty");
const posterControls = document.getElementById("posterControls");
const posterDots = document.getElementById("posterDots");
const posterCounter = document.getElementById("posterCounter");
const prevPoster = document.getElementById("prevPoster");
const nextPoster = document.getElementById("nextPoster");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector(".theme-icon");
const themeLabel = themeToggle.querySelector(".theme-label");

let posters = [];
let currentPoster = 0;
let posterTimer = null;

function padNumber(number) {
  return String(number).padStart(2, "0");
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);

  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "Light" : "Dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function renderPosterControls() {
  posterDots.innerHTML = "";

  posters.forEach((filename, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "poster-dot";
    dot.setAttribute("aria-label", `Show poster ${index + 1}`);
    dot.addEventListener("click", () => showPoster(index));
    posterDots.appendChild(dot);
  });
}

function updatePosterUI() {
  [...posterDots.children].forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentPoster);
  });

  posterCounter.textContent = `${padNumber(currentPoster + 1)} / ${padNumber(posters.length)}`;
}

function showPoster(index) {
  if (!posters.length) return;

  currentPoster = (index + posters.length) % posters.length;
  posterImage.classList.remove("is-visible");

  window.setTimeout(() => {
    posterImage.src = `assets/${posters[currentPoster]}`;
    posterImage.alt = `Announcement poster ${currentPoster + 1} of ${posters.length}`;
  }, 120);

  updatePosterUI();
}

function startPosterTimer() {
  window.clearInterval(posterTimer);

  if (posters.length > 1) {
    posterTimer = window.setInterval(() => {
      showPoster(currentPoster + 1);
    }, POSTER_INTERVAL);
  }
}

function showEmptyPostersState() {
  posterLoading.hidden = true;
  posterImage.hidden = true;
  posterEmpty.hidden = false;
  posterControls.hidden = true;
}

async function loadPosters() {
  try {
    const response = await fetch("assets/posters.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load posters.json (${response.status})`);
    }

    const data = await response.json();
    posters = Array.isArray(data)
      ? data.filter((item) => typeof item === "string" && item.trim())
      : [];

    posterLoading.hidden = true;

    if (!posters.length) {
      showEmptyPostersState();
      return;
    }

    posterImage.hidden = false;
    posterEmpty.hidden = true;
    posterControls.hidden = false;

    renderPosterControls();

    posterImage.addEventListener("load", () => {
      posterImage.classList.add("is-visible");
    }, { once: false });

    showPoster(0);
    startPosterTimer();
  } catch (error) {
    console.error(error);
    posterLoading.textContent = "Unable to load announcements.";
  }
}

function updateScoreboard() {
  const swafa = Number(SCORES.zumbaratulSwafa) || 0;
  const wafa = Number(SCORES.zumbaratulWafa) || 0;

  document.getElementById("swafaScore").textContent = swafa;
  document.getElementById("wafaScore").textContent = wafa;

  const leaderMessage = document.getElementById("leaderMessage");

  if (swafa > wafa) {
    leaderMessage.textContent = "Zumbaratul Swafa is currently leading";
  } else if (wafa > swafa) {
    leaderMessage.textContent = "Zumbaratul Wafa is currently leading";
  } else {
    leaderMessage.textContent = "Scores are tied";
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

prevPoster.addEventListener("click", () => {
  showPoster(currentPoster - 1);
  startPosterTimer();
});

nextPoster.addEventListener("click", () => {
  showPoster(currentPoster + 1);
  startPosterTimer();
});

initializeTheme();
updateScoreboard();
loadPosters();

window.setInterval(() => {
  window.location.reload();
}, PAGE_REFRESH_INTERVAL);
