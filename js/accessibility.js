const isEn = window.location.pathname.includes('/en/');
const label = isEn ? "Increase text size" : "Suurenna tekstiä";

const toggleBtn = document.createElement("button");
toggleBtn.innerHTML = '<i data-lucide="type"></i>';
toggleBtn.className = "accessibility-btn";
toggleBtn.ariaLabel = label;
toggleBtn.title = label;

document.body.appendChild(toggleBtn);

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

toggleBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("large-text");
  toggleBtn.classList.toggle("active");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
