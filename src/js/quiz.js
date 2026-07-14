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

      setTimeout(() => {
        goToStep(2);
      }, 300);
    });
  });

  // Back navigation buttons
  form.querySelectorAll(".btn-quiz-nav.prev").forEach(btn => {
    btn.addEventListener("click", () => {
      goToStep(currentStepIndex - 1);
    });
  });

  // Re-run icons initialization inside the form context
  createIcons({ icons: ICON_SET, root: form });
});
