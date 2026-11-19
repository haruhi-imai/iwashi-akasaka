const root = document.documentElement;
const hero = document.querySelector(".hero");
const header = document.querySelector(".header");
const preference = matchMedia("(prefers-reduced-motion: reduce)");

function updateHeaderHeight() {
  root.style.setProperty("--header-height", header.getBoundingClientRect().height + "px");
}

updateHeaderHeight();
new ResizeObserver(updateHeaderHeight).observe(header);

function finishIntro() {
  root.classList.remove("intro-pending");
  hero.classList.remove("is-intro");
}

async function startIntro() {
  try {
    await Promise.all([...hero.querySelectorAll("img")].map(image => image.decode()));
    if (!root.classList.contains("intro-pending") || preference.matches) return;
    hero.classList.add("is-intro");
    window.setTimeout(finishIntro, 2010);
  } catch {
    finishIntro();
  } finally {
    root.classList.remove("intro-pending");
  }
}

if (root.classList.contains("intro-pending")) startIntro();
preference.addEventListener("change", finishIntro);
hero.querySelector(".hero-actions").addEventListener("focusin", finishIntro);
