// Core DOM references
const enterArenaBtn = document.getElementById("enterArenaBtn");
const gamesSection = document.getElementById("games");
const form = document.getElementById("playerForm");
const nameInput = document.getElementById("playerName");
const emailInput = document.getElementById("playerEmail");
const formMessage = document.getElementById("formMessage");
const leaderboardList = document.getElementById("leaderboardList");
const leaderboardEmpty = document.getElementById("leaderboardEmpty");
const currentYearSpan = document.getElementById("currentYear");

// In-memory leaderboard state
const leaderboardEntries = [];

// Smooth scroll utility
function smoothScrollTo(element) {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Email validation helper (simple but effective for this use case)
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Display status for the registration form
function setFormStatus(type, message) {
  formMessage.textContent = message;
  formMessage.classList.remove("error", "success");
  if (type) {
    formMessage.classList.add(type);
  }
}

// Add a new player to the leaderboard, sort, and re-render
function addToLeaderboard(name) {
  const score = Math.floor(Math.random() * 101); // 0-100 inclusive

  leaderboardEntries.push({ name, score });

  leaderboardEntries.sort((a, b) => b.score - a.score);

  renderLeaderboard();

  // Briefly highlight the top row to show change
  const firstRow = leaderboardList.querySelector(".leaderboard-row");
  if (firstRow) {
    firstRow.classList.add("highlight");
    setTimeout(() => firstRow.classList.remove("highlight"), 1000);
  }
}

// Render the leaderboard list from state
function renderLeaderboard() {
  leaderboardList.innerHTML = "";

  if (leaderboardEntries.length === 0) {
    leaderboardEmpty.style.display = "block";
    return;
  }

  leaderboardEmpty.style.display = "none";

  leaderboardEntries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "leaderboard-row";

    const rankSpan = document.createElement("span");
    rankSpan.className = "leaderboard-rank";
    rankSpan.textContent = index + 1;

    const nameSpan = document.createElement("span");
    nameSpan.className = "leaderboard-name";
    nameSpan.textContent = entry.name;

    const scoreSpan = document.createElement("span");
    scoreSpan.className = "leaderboard-score";
    scoreSpan.textContent = entry.score;

    li.append(rankSpan, nameSpan, scoreSpan);
    leaderboardList.appendChild(li);
  });
}

// Form submission handler
function handleFormSubmit(event) {
  event.preventDefault();
  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();

  let hasError = false;
  nameInput.classList.remove("error");
  emailInput.classList.remove("error");

  if (!nameValue || !emailValue) {
    setFormStatus("error", "All fields are required to enter the arena.");
    if (!nameValue) nameInput.classList.add("error");
    if (!emailValue) emailInput.classList.add("error");
    hasError = true;
  } else if (!isValidEmail(emailValue)) {
    setFormStatus("error", "Provide a valid secure channel (email address).");
    emailInput.classList.add("error");
    hasError = true;
  }

  if (hasError) return;

  // At this point validation has passed
  setFormStatus("success", "Registration locked. Your survival index has been seeded.");

  addToLeaderboard(nameValue);

  form.reset();
}

// Intersection Observer for fade-in elements
function setupScrollAnimations() {
  const targets = document.querySelectorAll(".fade-in-on-scroll");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  targets.forEach((el) => observer.observe(el));
}

// Wire up events once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (enterArenaBtn && gamesSection) {
    enterArenaBtn.addEventListener("click", () => smoothScrollTo(gamesSection));
  }

  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // Simple nav smooth scrolling for in-page anchors
  document.querySelectorAll('.main-nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href")?.substring(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        e.preventDefault();
        smoothScrollTo(target);
      }
    });
  });

  setupScrollAnimations();

  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear().toString();
  }
});

