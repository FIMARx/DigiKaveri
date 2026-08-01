/* quiz.js - DigiKaveri Troubleshooter Quiz logic */
import { createIcons } from 'lucide';
import { ICON_SET } from './icons';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const steps = form.querySelectorAll(".quiz-step");
  const deviceInput = document.getElementById("quiz-device-input");
  const issueInput = document.getElementById("quiz-issue-input");

  let currentStepIndex = 0;
  let transitionTimer = null;

  const goToStep = (index) => {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === index);
    });
    currentStepIndex = index;
  };

  const scheduleStepChange = (targetStep) => {
    if (transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => {
      goToStep(targetStep);
      transitionTimer = null;
    }, 280);
  };

  // Initialize ARIA accessibility attributes on quiz option buttons
  form.querySelectorAll(".quiz-opt-btn").forEach(btn => {
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
  });

  const updateAriaChecked = (stepNum, activeBtn) => {
    form.querySelectorAll(`.quiz-step[data-step='${stepNum}'] .quiz-opt-btn`).forEach(b => {
      const isActive = b === activeBtn;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-checked", isActive ? "true" : "false");
    });
  };

  // Step 1 buttons
  form.querySelectorAll(".quiz-step[data-step='1'] .quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      updateAriaChecked("1", btn);

      const val = btn.getAttribute("data-value");
      const key = btn.getAttribute("data-key");
      if (deviceInput) deviceInput.value = val;

      // Reset Step 2 selection on Step 1 device change
      if (issueInput) issueInput.value = "";
      sessionStorage.removeItem('quiz-issue');
      sessionStorage.removeItem('quiz-issue-key');
      updateAriaChecked("2", null);

      // Save state
      sessionStorage.setItem('quiz-device', val);
      if (key) sessionStorage.setItem('quiz-device-key', key);
      
      scheduleStepChange(1);
    });
  });

  // Step 2 buttons
  form.querySelectorAll(".quiz-step[data-step='2'] .quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      updateAriaChecked("2", btn);

      const val = btn.getAttribute("data-value");
      const key = btn.getAttribute("data-key");
      if (issueInput) issueInput.value = val;

      // Save state
      sessionStorage.setItem('quiz-issue', val);
      if (key) sessionStorage.setItem('quiz-issue-key', key);

      scheduleStepChange(2);
    });
  });

  // WAI-ARIA Radio Group Keyboard Navigation (Arrow Keys)
  form.querySelectorAll(".quiz-options-grid[role='radiogroup']").forEach(grid => {
    grid.addEventListener("keydown", (e) => {
      const buttons = Array.from(grid.querySelectorAll(".quiz-opt-btn"));
      const currentIndex = buttons.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      }

      if (nextIndex !== null) {
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
      }
    });
  });

  // Back navigation buttons
  form.querySelectorAll(".btn-quiz-nav.prev").forEach(btn => {
    btn.addEventListener("click", () => {
      if (transitionTimer) clearTimeout(transitionTimer);
      const targetStep = currentStepIndex - 1;
      goToStep(targetStep);
      
      // Remove step items from session storage when going back
      if (targetStep === 0) {
        sessionStorage.removeItem('quiz-device');
        sessionStorage.removeItem('quiz-device-key');
        sessionStorage.removeItem('quiz-issue');
        sessionStorage.removeItem('quiz-issue-key');
        updateAriaChecked("1", null);
        updateAriaChecked("2", null);
      } else if (targetStep === 1) {
        sessionStorage.removeItem('quiz-issue');
        sessionStorage.removeItem('quiz-issue-key');
        updateAriaChecked("2", null);
      }
    });
  });

  // Reset event listener to clear state
  form.addEventListener("reset", () => {
    if (transitionTimer) clearTimeout(transitionTimer);
    sessionStorage.removeItem('quiz-device');
    sessionStorage.removeItem('quiz-device-key');
    sessionStorage.removeItem('quiz-issue');
    sessionStorage.removeItem('quiz-issue-key');
    updateAriaChecked("1", null);
    updateAriaChecked("2", null);
    goToStep(0);
  });

  // Restore state on load (Key-first, Value-fallback for cross-language compatibility)
  const savedDeviceKey = sessionStorage.getItem('quiz-device-key');
  const savedDevice = sessionStorage.getItem('quiz-device');
  const savedIssueKey = sessionStorage.getItem('quiz-issue-key');
  const savedIssue = sessionStorage.getItem('quiz-issue');
  let initialStep = 0;

  if (savedDeviceKey || savedDevice) {
    let deviceBtn = null;
    if (savedDeviceKey) {
      deviceBtn = form.querySelector(`.quiz-step[data-step='1'] .quiz-opt-btn[data-key="${savedDeviceKey}"]`);
    }
    if (!deviceBtn && savedDevice) {
      deviceBtn = form.querySelector(`.quiz-step[data-step='1'] .quiz-opt-btn[data-value="${savedDevice}"]`);
    }
    if (deviceBtn) {
      updateAriaChecked("1", deviceBtn);
      if (deviceInput) deviceInput.value = deviceBtn.getAttribute("data-value");
      initialStep = 1;
    }
  }

  if (savedIssueKey || savedIssue) {
    let issueBtn = null;
    if (savedIssueKey) {
      issueBtn = form.querySelector(`.quiz-step[data-step='2'] .quiz-opt-btn[data-key="${savedIssueKey}"]`);
    }
    if (!issueBtn && savedIssue) {
      issueBtn = form.querySelector(`.quiz-step[data-step='2'] .quiz-opt-btn[data-value="${savedIssue}"]`);
    }
    if (issueBtn) {
      updateAriaChecked("2", issueBtn);
      if (issueInput) issueInput.value = issueBtn.getAttribute("data-value");
      if (initialStep === 1) {
        initialStep = 2;
      }
    }
  }

  goToStep(initialStep);

  // Ensure default values on submit if skipped
  form.addEventListener("submit", () => {
    const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
    if (deviceInput && !deviceInput.value) {
      deviceInput.value = isEn ? "General IT Support / Device (Not selected)" : "Yleinen IT-tuki / Laite (Ei valittu)";
    }
    if (issueInput && !issueInput.value) {
      issueInput.value = isEn ? "General Contact / Callback Request" : "Soittopyyntö / Yleinen yhteydenotto";
    }
  });

  // Re-run icons initialization inside the form context
  try { createIcons({ icons: ICON_SET, root: form }); } catch (e) { console.warn("Lucide icon init warning:", e); }
});
