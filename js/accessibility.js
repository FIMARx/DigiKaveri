const toggleBtn = document.createElement("button");
toggleBtn.innerHTML = '<i data-lucide="type"></i>';
toggleBtn.className = "accessibility-btn";
toggleBtn.ariaLabel = "Suurenna tekstiä";
toggleBtn.title = "Suurenna tekstiä";

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
