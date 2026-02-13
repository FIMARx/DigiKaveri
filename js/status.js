// js/status.js

async function checkStatus() {
    const badge = document.getElementById('serviceStatus');
    const text = document.getElementById('statusText');

    try {
        // Fetch the status from your JSON file
        // add a timestamp to prevent browser caching (?v=...)
        const response = await fetch('status.json?v=' + new Date().getTime());
        const data = await response.json();

        if (data.isOpen) {
            // SET TO GREEN / OPEN
            badge.className = 'status-badge open';
            text.textContent = data.messageOpen;
        } else {
            // SET TO RED / CLOSED
            badge.className = 'status-badge closed';
            text.textContent = data.messageClosed;
        }
    } catch (error) {
        console.error('Status check failed', error);
        // Fallback if something breaks
        badge.className = 'status-badge closed';
        text.textContent = "Palvelu suljettu";
    }
}

// Run immediately when page loads
checkStatus();

// Optional: Check again every 60 seconds without refreshing page
setInterval(checkStatus, 60000);