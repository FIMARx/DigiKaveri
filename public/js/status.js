async function checkStatus() {
  const badge = document.getElementById("serviceStatus");
  const text = document.getElementById("statusText");

  try {
    const response = await fetch("status.json?v=" + new Date().getTime());
    const data = await response.json();

    if (data.isOpen) {
      badge.className = "status-badge open";
      text.textContent = data.messageOpen;
    } else {
      badge.className = "status-badge closed";
      text.textContent = data.messageClosed;
    }
  } catch (error) {
    console.error("Status check failed", error);

    badge.className = "status-badge closed";
    text.textContent = "Palvelu suljettu";
  }
}

checkStatus();

setInterval(checkStatus, 60000);
