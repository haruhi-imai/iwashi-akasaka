(() => {
  const key = "iwashi-akasaka-theme";
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const lightThemeColor = themeColor.content;
  let button;

  function apply(dark) {
    root.dataset.theme = dark ? "dark" : "light";
    themeColor.content = dark ? "#0b0b0b" : lightThemeColor;
    if (!button) return;
    const next = dark ? "白" : "黒";
    button.setAttribute("aria-label", next + "表示に切り替える");
    button.title = button.getAttribute("aria-label");
  }

  function restore() {
    try {
      apply(localStorage.getItem(key) !== "light");
    } catch {
      apply(root.dataset.theme !== "light");
    }
  }

  restore();
  document.addEventListener("DOMContentLoaded", () => {
    button = document.querySelector(".theme-toggle");
    apply(root.dataset.theme === "dark");
    button.hidden = false;
    button.addEventListener("click", () => {
      apply(root.dataset.theme !== "dark");
      try {
        localStorage.setItem(key, root.dataset.theme);
      } catch {
        // The switch still works on this page when storage is unavailable.
      }
    });
  });

  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) restore();
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) restore();
  });
})();
