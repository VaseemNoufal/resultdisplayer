const POSTER_INTERVAL = 4000;
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


/* =========================================================
   HELPERS
   ========================================================= */

function padNumber(number) {
  return String(number).padStart(2, "0");
}


/* =========================================================
   THEME
   ========================================================= */

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;

  localStorage.setItem(THEME_KEY, theme);

  const isDark = theme === "dark";

  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "Light" : "Dark";

  themeToggle.setAttribute(
    "aria-label",
    isDark
      ? "Switch to light theme"
      : "Switch to dark theme"
  );

  themeToggle.setAttribute(
    "aria-pressed",
    String(isDark)
  );
}


function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
    return;
  }

  const prefersDark = window
    .matchMedia("(prefers-color-scheme: dark)")
    .matches;

  setTheme(prefersDark ? "dark" : "light");
}


/* =========================================================
   POSTER CONTROLS
   ========================================================= */

function renderPosterControls() {
  posterDots.innerHTML = "";

  posters.forEach((filename, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "poster-dot";

    dot.setAttribute(
      "aria-label",
      `Show poster ${index + 1}`
    );

    dot.addEventListener("click", () => {
      showPoster(index);
      restartPosterTimer();
    });

    posterDots.appendChild(dot);
  });
}


function updatePosterUI() {
  [...posterDots.children].forEach((dot, index) => {
    dot.classList.toggle(
      "is-active",
      index === currentPoster
    );
  });

  posterCounter.textContent =
    `${padNumber(currentPoster + 1)} / ${padNumber(posters.length)}`;
}


/* =========================================================
   SHOW POSTER
   ========================================================= */

function showPoster(index) {
  if (!posters.length) {
    return;
  }

  currentPoster =
    (index + posters.length) % posters.length;

  posterImage.classList.remove("is-visible");

  window.setTimeout(() => {
    posterImage.src =
      `assets/${posters[currentPoster]}`;

    posterImage.alt =
      `Announcement poster ${currentPoster + 1} of ${posters.length}`;
  }, 120);

  updatePosterUI();
}


/* =========================================================
   POSTER SLIDESHOW
   ========================================================= */

/*
    IMPORTANT:

    There is NO 10-second page refresh anymore.

    The posters change every 4 seconds.

    When the slideshow reaches the LAST poster and
    that poster has been displayed for 4 seconds,
    the entire page reloads.

    Example with 3 posters:

    Poster 1
       ↓ 4 sec
    Poster 2
       ↓ 4 sec
    Poster 3
       ↓ 4 sec
    PAGE RELOAD
       ↓
    Poster 1
*/


function startPosterTimer() {
  window.clearInterval(posterTimer);

  if (!posters.length) {
    return;
  }

  posterTimer = window.setInterval(() => {

    /*
      If we are currently showing the LAST poster,
      the full slideshow revolution is finished.

      Reload the page instead of jumping back to
      poster 1.
    */

    if (currentPoster === posters.length - 1) {

      window.clearInterval(posterTimer);

      window.location.reload();

      return;
    }

    /*
      Otherwise move to the next poster.
    */

    showPoster(currentPoster + 1);

  }, POSTER_INTERVAL);
}


/*
    Restart the 4-second timer.

    This is used when the user manually clicks
    Previous / Next / a poster dot.
*/

function restartPosterTimer() {
  startPosterTimer();
}


/* =========================================================
   EMPTY POSTER STATE
   ========================================================= */

function showEmptyPostersState() {
  posterLoading.hidden = true;

  posterImage.hidden = true;

  posterEmpty.hidden = false;

  posterControls.hidden = true;
}


/* =========================================================
   LOAD POSTERS
   ========================================================= */

async function loadPosters() {

  try {

    /*
      cache: "no-store" is important.

      This makes sure that when the page reloads after
      the slideshow finishes, the newest posters.json
      is fetched instead of relying on an old cached copy.
    */

    const response = await fetch(
      `assets/posters.json?t=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Could not load posters.json (${response.status})`
      );
    }

    const data = await response.json();

    posters = Array.isArray(data)
      ? data.filter(
          (item) =>
            typeof item === "string" &&
            item.trim()
        )
      : [];

    posterLoading.hidden = true;


    /* -------------------------------------------------------
       NO POSTERS
       ------------------------------------------------------- */

    if (!posters.length) {

      showEmptyPostersState();

      return;
    }


    /* -------------------------------------------------------
       POSTERS AVAILABLE
       ------------------------------------------------------- */

    posterImage.hidden = false;

    posterEmpty.hidden = true;

    posterControls.hidden = false;


    /* Create dots */

    renderPosterControls();


    /*
      When the image finishes loading, fade it in.
    */

    posterImage.addEventListener(
      "load",
      () => {
        posterImage.classList.add("is-visible");
      },
      {
        once: false
      }
    );


    /*
      Start from the first poster.
    */

    currentPoster = 0;

    showPoster(0);


    /*
      Start the 4-second slideshow.
    */

    startPosterTimer();

  } catch (error) {

    console.error(error);

    posterLoading.textContent =
      "Unable to load announcements.";
  }
}


/* =========================================================
   SCOREBOARD
   ========================================================= */

function updateScoreboard() {

  const swafa =
    Number(SCORES.zumbaratulSwafa) || 0;

  const wafa =
    Number(SCORES.zumbaratulWafa) || 0;


  document.getElementById(
    "swafaScore"
  ).textContent = swafa;


  document.getElementById(
    "wafaScore"
  ).textContent = wafa;


  const leaderMessage =
    document.getElementById(
      "leaderMessage"
    );


  if (swafa > wafa) {

    leaderMessage.textContent =
      "Zumbaratul Swafa is currently leading";

  } else if (wafa > swafa) {

    leaderMessage.textContent =
      "Zumbaratul Wafa is currently leading";

  } else {

    leaderMessage.textContent =
      "Scores are tied";
  }
}


/* =========================================================
   THEME BUTTON
   ========================================================= */

themeToggle.addEventListener(
  "click",
  () => {

    const currentTheme =
      document.documentElement.dataset.theme;

    setTheme(
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  }
);


/* =========================================================
   PREVIOUS POSTER
   ========================================================= */

prevPoster.addEventListener(
  "click",
  () => {

    showPoster(currentPoster - 1);

    restartPosterTimer();
  }
);


/* =========================================================
   NEXT POSTER
   ========================================================= */

nextPoster.addEventListener(
  "click",
  () => {

    showPoster(currentPoster + 1);

    restartPosterTimer();
  }
);


/* =========================================================
   INITIALIZE WEBSITE
   ========================================================= */

initializeTheme();

updateScoreboard();

loadPosters();