// js/accessibility.js

// 1. Create the floating button
const toggleBtn = document.createElement('button');
toggleBtn.innerHTML = '<i data-lucide="type"></i>'; // This starts as an empty <i> tag
toggleBtn.className = 'accessibility-btn';
toggleBtn.ariaLabel = 'Suurenna tekstiä';
toggleBtn.title = 'Suurenna tekstiä'; // Tooltip

// 2. Add to page
document.body.appendChild(toggleBtn);

// 3. FORCE ICON RENDER IMMEDIATELY (The Fix)
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// 4. State & Click Handler
let isLargeText = false;

toggleBtn.addEventListener('click', () => {
    isLargeText = !isLargeText;
    
    if (isLargeText) {
        document.documentElement.style.fontSize = '20px'; 
        toggleBtn.style.background = '#2563EB'; // Blue background
        toggleBtn.style.color = 'white';        // White text
    } else {
        document.documentElement.style.fontSize = '16px'; 
        toggleBtn.style.background = 'white';   // White background
        toggleBtn.style.color = '#111827';      // Dark text (Fixes white-on-white)
    }
    
    // Re-render icons just in case
    lucide.createIcons();
});