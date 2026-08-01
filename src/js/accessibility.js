
const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
const label = isEn ? "Increase text size" : "Suurenna tekstiä";

const toggleBtn = document.createElement("button");
toggleBtn.innerHTML = '<span style="font-weight: 800; font-size: 1.1rem; letter-spacing: -1px;">AA</span>';
toggleBtn.className = "accessibility-btn";
// Bug 8 fix: use setAttribute instead of the non-standard .ariaLabel property
// for cross-browser compatibility (older browsers don't support ARIA reflection API)
toggleBtn.setAttribute('aria-label', label);
toggleBtn.setAttribute('aria-pressed', 'false');
toggleBtn.title = label;

function onDOMReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

onDOMReady(() => {
  if (!document.body) return;

  // Restore saved state from localStorage
  const savedState = localStorage.getItem("largeText");
  if (savedState === "true") {
    document.documentElement.classList.add("large-text");
    toggleBtn.classList.add("active");
    toggleBtn.setAttribute("aria-pressed", "true");
  }

  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    // Capture current relative position
    const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = totalScrollable > 0 ? window.scrollY / totalScrollable : 0;

    const isLarge = document.documentElement.classList.toggle("large-text");
    toggleBtn.classList.toggle("active", isLarge);
    toggleBtn.setAttribute("aria-pressed", isLarge ? "true" : "false");
    localStorage.setItem("largeText", isLarge ? "true" : "false");

    // Restore relative position after layout update
    requestAnimationFrame(() => {
      const newTotalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollPct * newTotalScrollable);
    });
  });
});
