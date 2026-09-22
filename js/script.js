const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setTheme = (light) => {
  body.classList.toggle("light-mode", light);
  themeToggle?.setAttribute("aria-pressed", String(light));
  if (themeToggle) themeToggle.textContent = light ? "☾" : "☼";
  localStorage.setItem("portfolio-theme", light ? "light" : "dark");
};
setTheme(localStorage.getItem("portfolio-theme") === "light");
themeToggle?.addEventListener("click", () => setTheme(!body.classList.contains("light-mode")));

const closeMenu = () => {
  nav?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Buka menu");
  body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  if (!nav) return;
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  body.classList.toggle("menu-open", open);
});
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => { if (window.innerWidth > 700) closeMenu(); });

const updateHeader = () => {
  document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Smooth scrolling tetap native, tetapi memberi offset untuk header yang menempel.
document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => {
  const targetId = link.getAttribute("href");
  const target = targetId && document.querySelector(targetId);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", targetId);
  closeMenu();
}));

const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll(".slider-dots button")];
const heroCards = [...document.querySelectorAll(".hero-card")];
const slideNumber = document.querySelector(".slide-number");
const progress = document.querySelector(".slider-progress span");
let current = 0;
let timer;
function showSlide(index) {
  if (!slides.length) return;
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  heroCards.forEach((card, i) => card.classList.toggle("active", i === current));
  if (slideNumber) slideNumber.textContent = String(current + 1).padStart(2, "0");
  if (progress) progress.style.width = `${((current + 1) / slides.length) * 100}%`;
}
function restartSlider() {
  clearInterval(timer);
  timer = setInterval(() => showSlide(current + 1), 5500);
}
document.querySelector(".slider-next")?.addEventListener("click", () => { showSlide(current + 1); restartSlider(); });
document.querySelector(".slider-prev")?.addEventListener("click", () => { showSlide(current - 1); restartSlider(); });
dots.forEach((dot, i) => dot.addEventListener("click", () => { showSlide(i); restartSlider(); }));
restartSlider();

const activityCard = document.querySelector(".activity-card");
activityCard?.addEventListener("pointermove", (event) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 701) return;
  const rect = activityCard.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
  const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
  activityCard.style.transform = `perspective(1100px) rotateX(${y * -1.2}deg) rotateY(${x * 1.2}deg)`;
});
activityCard?.addEventListener("pointerleave", () => { activityCard.style.transform = ""; });

const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const closeLightbox = () => { lightbox?.classList.remove("is-open"); lightbox?.setAttribute("aria-hidden", "true"); body.classList.remove("modal-open"); };
document.querySelectorAll(".activity-photo").forEach((photo) => photo.addEventListener("click", () => {
  const image = photo.querySelector("img");
  if (!image || !lightbox) return;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = photo.querySelector("figcaption")?.textContent || image.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}));
lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);

if (window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  document.addEventListener("pointermove", (event) => {
    cursorDot.style.left = `${event.clientX}px`; cursorDot.style.top = `${event.clientY}px`;
    cursorRing.style.left = `${event.clientX}px`; cursorRing.style.top = `${event.clientY}px`;
    document.querySelector(".hero")?.style.setProperty("--mx", `${event.clientX}px`);
    document.querySelector(".hero")?.style.setProperty("--my", `${event.clientY}px`);
    if (activityCard) { const rect = activityCard.getBoundingClientRect(); activityCard.style.setProperty("--mx", `${event.clientX - rect.left}px`); activityCard.style.setProperty("--my", `${event.clientY - rect.top}px`); }
  });
  document.querySelectorAll("a,button,.project-card,.activity-photo").forEach((item) => item.addEventListener("mouseenter", () => cursorRing.classList.add("is-hover")));
  document.querySelectorAll("a,button,.project-card,.activity-photo").forEach((item) => item.addEventListener("mouseleave", () => cursorRing.classList.remove("is-hover")));
}

document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeLightbox(); });

const revealItems = document.querySelectorAll(".intro-content,.project-card,.activity-card,.activity-photo,.skills-layout,.profile-card,.cv-grid article,.contact h2,.contact-email");
revealItems.forEach((item) => item.classList.add("reveal"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, observerRef) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observerRef.unobserve(entry.target);
    });
  }, { threshold: .12 });
  revealItems.forEach((item) => observer.observe(item));
} else revealItems.forEach((item) => item.classList.add("is-visible"));

const modal = document.querySelector("#project-modal");
const modalTitle = document.querySelector("#modal-title");
const modalText = document.querySelector("#modal-text");
const closeModal = () => {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
};
document.querySelectorAll("[data-project]").forEach((card) => card.addEventListener("click", () => {
  modalTitle.textContent = card.dataset.project;
  modalText.textContent = card.dataset.description;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}));
document.querySelector(".modal-close")?.addEventListener("click", closeModal);
modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });