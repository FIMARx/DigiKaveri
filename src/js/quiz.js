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

  const goToStep = (index) => {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === index);
    });
    currentStepIndex = index;
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
      if (deviceInput) deviceInput.value = val;

      // Reset Step 2 selection on Step 1 device change
      if (issueInput) issueInput.value = "";
      sessionStorage.removeItem('quiz-issue');
      updateAriaChecked("2", null);

      // Save state
      sessionStorage.setItem('quiz-device', val);
      
      // Dynamic transition delay for smooth UX
      setTimeout(() => {
        goToStep(1);
      }, 300);
    });
  });

  // Step 2 buttons
  form.querySelectorAll(".quiz-step[data-step='2'] .quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      updateAriaChecked("2", btn);

      const val = btn.getAttribute("data-value");
      if (issueInput) issueInput.value = val;

      // Save state
      sessionStorage.setItem('quiz-issue', val);

      setTimeout(() => {
        goToStep(2);
      }, 300);
    });
  });

  // Back navigation buttons
  form.querySelectorAll(".btn-quiz-nav.prev").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetStep = currentStepIndex - 1;
      goToStep(targetStep);
      
      // Remove step items from session storage when going back
      if (targetStep === 0) {
        sessionStorage.removeItem('quiz-device');
        sessionStorage.removeItem('quiz-issue');
        updateAriaChecked("1", null);
        updateAriaChecked("2", null);
      } else if (targetStep === 1) {
        sessionStorage.removeItem('quiz-issue');
        updateAriaChecked("2", null);
      }
    });
  });

  // Reset event listener to clear state
  form.addEventListener("reset", () => {
    sessionStorage.removeItem('quiz-device');
    sessionStorage.removeItem('quiz-issue');
    updateAriaChecked("1", null);
    updateAriaChecked("2", null);
    goToStep(0);
  });

  // Restore state on load
  const savedDevice = sessionStorage.getItem('quiz-device');
  const savedIssue = sessionStorage.getItem('quiz-issue');
  let initialStep = 0;

  if (savedDevice) {
    if (deviceInput) deviceInput.value = savedDevice;
    const deviceBtn = form.querySelector(`.quiz-step[data-step='1'] .quiz-opt-btn[data-value="${savedDevice}"]`);
    if (deviceBtn) updateAriaChecked("1", deviceBtn);
    initialStep = 1;
  }

  if (savedIssue) {
    if (issueInput) issueInput.value = savedIssue;
    const issueBtn = form.querySelector(`.quiz-step[data-step='2'] .quiz-opt-btn[data-value="${savedIssue}"]`);
    if (issueBtn) updateAriaChecked("2", issueBtn);
    if (savedDevice) {
      initialStep = 2;
    }
  }

  goToStep(initialStep);

  // Ensure default values on submit if skipped
  form.addEventListener("submit", () => {
    if (deviceInput && !deviceInput.value) {
      deviceInput.value = "Yleinen IT-tuki / Laite (Ei valittu)";
    }
    if (issueInput && !issueInput.value) {
      issueInput.value = "Soittopyyntö / Yleinen yhteydenotto";
    }
  });

  // Re-run icons initialization inside the form context
  try { createIcons({ icons: ICON_SET, root: form }); } catch (e) { console.warn("Lucide icon init warning:", e); }
});
