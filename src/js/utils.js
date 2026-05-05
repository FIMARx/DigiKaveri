/**
 * Reliable Helsinki hour calculation regardless of visitor's locale.
 */
export function getFinlandHour() {
  return parseInt(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Helsinki',
    hour: 'numeric',
    hour12: false
  }).format(new Date()));
}

/**
 * Re-activates analytics scripts (type="text/plain") after consent is granted.
 */
export function triggerAnalyticsExecution(category = "analytics") {
  const scripts = document.querySelectorAll(`script[type="text/plain"][data-cookiecategory="${category}"]`);
  
  if (scripts.length > 0 && category === "analytics") {
    if (typeof gtag === 'function') {
      gtag('config', 'G-XL8DBWDDMD', { 'anonymize_ip': true });
    }
  }

  scripts.forEach(oldScript => {
    // Safety Guard: Ensure the script actually has a parent before replacement
    if (!oldScript.parentNode) return;
    
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach(a => {
      if (a.name !== 'type') newScript.setAttribute(a.name, a.value);
    });
    newScript.innerHTML = oldScript.innerHTML;
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}
