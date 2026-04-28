import { createIcons } from 'lucide';
import { ICON_SET } from './icons';

const isEn = window.location.pathname.includes('/en/');
const label = isEn ? "Increase text size" : "Suurenna tekstiä";

const toggleBtn = document.createElement("button");
toggleBtn.innerHTML = '<span style="font-weight: 800; font-size: 1.1rem; letter-spacing: -1px;">AA</span>';
toggleBtn.className = "accessibility-btn";
toggleBtn.ariaLabel = label;
toggleBtn.title = label;

document.body.appendChild(toggleBtn);

createIcons({ icons: ICON_SET });

toggleBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("large-text");
  toggleBtn.classList.toggle("active");
  createIcons({ icons: ICON_SET });
});
