// js/accessibility.js

// 1. Create the floating button
const toggleBtn = document.createElement('button');
toggleBtn.innerHTML = '<i data-lucide="type"></i>'; // This starts as an empty <i> tag
toggleBtn.className = 'accessibility-btn';
toggleBtn.ariaLabel = 'Suurenna tekstiä';
toggleBtn.title = 'Suurenna tekstiä'; // Tooltip

// 2. Add to page
document.body.appendChild(toggleBtn);

// 3. FORCE ICON RENDER IMMEDIATELY
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// 4. Click Handler (Clean CSS Class Method)
toggleBtn.addEventListener('click', () => {
    // Toggles the 'large-text' class on the <html> element
    document.documentElement.classList.toggle('large-text');
    
    // Toggles the 'active' class on the button (makes it blue)
    toggleBtn.classList.toggle('active');
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});