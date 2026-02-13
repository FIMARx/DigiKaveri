// js/main.js

lucide.createIcons();

async function checkStatus() {
    const badge = document.getElementById('serviceStatus');
    const text = document.getElementById('statusText');

    if (!badge || !text) return;

    try {
        // Fetch the status from your JSON file
        const response = await fetch('data/status.json?v=' + Date.now());
        const data = await response.json();

        if (data.isOpen) {
            badge.className = 'status-badge open';
            text.textContent = data.messageOpen;
        } else {
            badge.className = 'status-badge closed';
            text.textContent = data.messageClosed;
        }
    } catch (error) {
        console.error('Status check error:', error);
        // If it fails, show closed (safe default)
        badge.className = 'status-badge closed';
        text.textContent = "Palvelu suljettu";
    }
}

// Run immediately
checkStatus();

// Check again every 60 seconds
setInterval(checkStatus, 60000);