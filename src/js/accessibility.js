
const isEn = window.location.pathname.includes('/en/');
const label = isEn ? "Increase text size" : "Suurenna tekstiä";

const toggleBtn = document.createElement("button");
toggleBtn.innerHTML = '<span style="font-weight: 800; font-size: 1.1rem; letter-spacing: -1px;">AA</span>';
toggleBtn.className = "accessibility-btn";
toggleBtn.ariaLabel = label;
toggleBtn.title = label;

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body) return;
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    // Capture current relative position
    const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = totalScrollable > 0 ? window.scrollY / totalScrollable : 0;

    document.documentElement.classList.toggle("large-text");
    toggleBtn.classList.toggle("active");

    // Restore relative position after layout update
    // We use requestAnimationFrame to ensure the layout has updated
    requestAnimationFrame(() => {
      const newTotalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollPct * newTotalScrollable);
    });
  });
});
