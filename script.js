// Core DOM references
const heroSection = document.getElementById("hero");
const heroBg = document.querySelector(".hero-bg");
const heroContent = document.querySelector(".hero-content");
const heroParticlesCanvas = document.getElementById("heroParticles");
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

// Animate a number from 0 up to targetScore
function animateScore(element, targetScore) {
  let start = 0;
  const duration = 700;
  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (targetScore - start) * eased);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

// Add a new player to the leaderboard, sort, and re-render
function addToLeaderboard(name) {
  const score = Math.floor(Math.random() * 101); // 0-100 inclusive

  leaderboardEntries.push({ name, score });

  leaderboardEntries.sort((a, b) => b.score - a.score);

  renderLeaderboard(true);
}

// Render the leaderboard list from state
function renderLeaderboard(animateLatest = false) {
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

    if (animateLatest && index === 0) {
      animateScore(scoreSpan, entry.score);
    } else {
      scoreSpan.textContent = entry.score;
    }

    li.append(rankSpan, nameSpan, scoreSpan);
    leaderboardList.appendChild(li);
  });

  if (animateLatest) {
    const firstRow = leaderboardList.querySelector(".leaderboard-row");
    if (firstRow) {
      firstRow.classList.add("highlight");
      setTimeout(() => firstRow.classList.remove("highlight"), 1000);
    }
  }
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

// Background parallax for hero
function setupHeroParallax() {
  if (!heroSection || !heroBg) return;

  let ticking = false;

  function updateParallax() {
    const rect = heroSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.min(Math.max(-rect.top / windowHeight, 0), 1);

    const translateY = progress * 40; // pixels
    const scale = 1.08 + progress * 0.06;

    heroBg.style.transform = `translateY(${translateY}px) scale(${scale})`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  updateParallax();
  window.addEventListener("scroll", onScroll);
}

// 3D tilt effect for hero content
function setupHeroTilt() {
  if (!heroSection || !heroContent) return;

  const maxTilt = 6;
  let timeoutId;

  heroSection.addEventListener("mousemove", (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const rotateX = -percentY * maxTilt;
    const rotateY = percentX * maxTilt;

    heroContent.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      heroContent.style.transform = "";
    }, 150);
  });

  heroSection.addEventListener("mouseleave", () => {
    heroContent.style.transform = "";
  });
}

// Simple particle system for hero background canvas
function setupHeroParticles() {
  if (!heroParticlesCanvas) return;

  const ctx = heroParticlesCanvas.getContext("2d");
  if (!ctx) return;

  const particles = [];
  const particleCount = 40;

  function resize() {
    heroParticlesCanvas.width = window.innerWidth;
    heroParticlesCanvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
  }

  function createParticle() {
    const w = heroParticlesCanvas.width;
    const h = heroParticlesCanvas.height;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 0.5 + Math.random() * 1.4,
      speedY: 0.2 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: 0.2 + Math.random() * 0.5,
    };
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push(createParticle());
    }
  }

  function step() {
    const w = heroParticlesCanvas.width;
    const h = heroParticlesCanvas.height;

    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y - p.radius > h) {
        Object.assign(p, createParticle(), { y: -p.radius });
      }

      ctx.beginPath();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
      gradient.addColorStop(0, `rgba(255, 0, 153, ${p.alpha})`);
      gradient.addColorStop(1, "rgba(255, 0, 153, 0)");
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  resize();
  initParticles();
  window.addEventListener("resize", () => {
    resize();
    initParticles();
  });
  requestAnimationFrame(step);
}

// 3D tilt effect for game cards
function setupCardTilt() {
  const cards = document.querySelectorAll(".game-card");
  if (!cards.length) return;

  const maxTilt = 10; // degrees

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const rotateX = -percentY * maxTilt;
      const rotateY = percentX * maxTilt;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Wire up events once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (heroSection) {
    heroSection.classList.add("loaded");
  }

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
  setupHeroParallax();
  setupHeroTilt();
  setupHeroParticles();
  setupCardTilt();

  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear().toString();
  }
});

