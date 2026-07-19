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

  // Step 1 buttons
  form.querySelectorAll(".quiz-step[data-step='1'] .quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Clear active class from siblings
      form.querySelectorAll(".quiz-step[data-step='1'] .quiz-opt-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const val = btn.getAttribute("data-value");
      if (deviceInput) deviceInput.value = val;

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
      // Clear active class from siblings
      form.querySelectorAll(".quiz-step[data-step='2'] .quiz-opt-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

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
        form.querySelectorAll(".quiz-step .quiz-opt-btn").forEach(b => b.classList.remove("active"));
      } else if (targetStep === 1) {
        sessionStorage.removeItem('quiz-issue');
        form.querySelectorAll(".quiz-step[data-step='2'] .quiz-opt-btn").forEach(b => b.classList.remove("active"));
      }
    });
  });

  // Reset event listener to clear state
  form.addEventListener("reset", () => {
    sessionStorage.removeItem('quiz-device');
    sessionStorage.removeItem('quiz-issue');
    form.querySelectorAll(".quiz-step .quiz-opt-btn").forEach(b => b.classList.remove("active"));
    goToStep(0);
  });

  // Restore state on load
  const savedDevice = sessionStorage.getItem('quiz-device');
  const savedIssue = sessionStorage.getItem('quiz-issue');
  let initialStep = 0;

  if (savedDevice) {
    if (deviceInput) deviceInput.value = savedDevice;
    const deviceBtn = form.querySelector(`.quiz-step[data-step='1'] .quiz-opt-btn[data-value="${savedDevice}"]`);
    if (deviceBtn) deviceBtn.classList.add("active");
    initialStep = 1;
  }

  if (savedIssue) {
    if (issueInput) issueInput.value = savedIssue;
    const issueBtn = form.querySelector(`.quiz-step[data-step='2'] .quiz-opt-btn[data-value="${savedIssue}"]`);
    if (issueBtn) issueBtn.classList.add("active");
    if (savedDevice) {
      initialStep = 2;
    }
  }

  goToStep(initialStep);

  // Re-run icons initialization inside the form context
  createIcons({ icons: ICON_SET, root: form });
});
