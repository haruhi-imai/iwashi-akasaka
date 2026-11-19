(() => {
  const header = document.querySelector(".masthead");
  const hero = document.querySelector(".hero");
  const menu = document.querySelector("#mobile-menu");
  const toggle = document.querySelector(".menu-toggle");
  const desktop = window.matchMedia("(min-width: 1025px)");

  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("menu-open", open);
    document.querySelector("main").inert = open;
    document.querySelector("footer").inert = open;
  }

  toggle.addEventListener("click", () => setMenu(menu.hidden));
  header.addEventListener("click", event => {
    if (event.target.closest("a") && !menu.hidden) setMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  desktop.addEventListener("change", () => setMenu(false));
  window.addEventListener("hashchange", () => setMenu(false));

  function updateHeader() {
    header.classList.toggle("over-hero", hero.getBoundingClientRect().bottom >= header.offsetHeight);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);
  updateHeader();

  const video = document.querySelector(".hero-film");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const control = document.querySelector(".film-control");
  const icon = control.querySelector("span");

  function updateControl() {
    const playing = !video.paused;
    control.setAttribute("aria-label", playing ? "映像を一時停止" : "映像を再生");
    icon.textContent = playing ? "Ⅱ" : "▶";
  }

  function setFilm() {
    if (motion.matches) {
      video.pause();
      video.classList.remove("is-playing");
      control.hidden = true;
      return;
    }
    if (!video.hasAttribute("src")) video.src = video.dataset.src;
    control.hidden = false;
    video.play().catch(updateControl);
  }

  control.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(updateControl);
    } else {
      video.pause();
    }
  });
  video.addEventListener("playing", () => {
    video.classList.add("is-playing");
    updateControl();
  });
  video.addEventListener("pause", updateControl);
  video.addEventListener("error", () => {
    video.classList.remove("is-playing");
    control.hidden = true;
  });
  motion.addEventListener("change", setFilm);
  setFilm();
})();
