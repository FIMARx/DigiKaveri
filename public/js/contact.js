function showToast(message, isSuccess = true) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${isSuccess ? 'toast-success' : 'toast-error'}`;
  
  const icon = isSuccess ? 'check-circle' : 'alert-circle';
  toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
  
  toastContainer.appendChild(toast);
  if (typeof lucide !== "undefined") lucide.createIcons({ root: toastContainer });

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

const translations = {
  fi: {
    loading: 'Lähetetään...',
    success: 'Viesti lähetetty!',
    error: 'Virhe! Yritä uudelleen.',
    connError: 'Yhteysvirhe!',
    required: 'Tämä kenttä on pakollinen.',
    tooShort: (min) => `Tekstin pitää olla vähintään ${min} merkkiä pitkä.`,
    invalidEmail: 'Anna voimassa oleva sähköpostiosoite.',
    invalidPhone: 'Anna voimassa oleva puhelinnumero.',
    thankYou: 'Kiitos viestistäsi! Olemme sinuun pian yhteydessä.',
    sendError: 'Viestin lähetyksessä tapahtui virhe. Yritä uudelleen myöhemmin.',
    netError: 'Tapahtui yhteysvirhe. Tarkista verkkoyhteytesi.'
  },
  en: {
    loading: 'Sending...',
    success: 'Message sent!',
    error: 'Error! Try again.',
    connError: 'Connection error!',
    required: 'This field is required.',
    tooShort: (min) => `Text must be at least ${min} characters long.`,
    invalidEmail: 'Please enter a valid email address.',
    invalidPhone: 'Please enter a valid phone number.',
    thankYou: 'Thank you for your message! We will get back to you soon.',
    sendError: 'Error sending message. Please try again later.',
    netError: 'Connection error. Please check your internet connection.'
  }
};

function setupForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const isEn = window.location.pathname.includes('/en/');
  const t = isEn ? translations.en : translations.fi;

  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    input.addEventListener("invalid", () => {
      if (input.validity.valueMissing) {
        input.setCustomValidity(t.required);
      } else if (input.validity.tooShort) {
        const minLength = input.getAttribute("minlength");
        input.setCustomValidity(t.tooShort(minLength));
      } else if (
        (input.validity.typeMismatch || input.validity.patternMismatch) &&
        input.type === "email"
      ) {
        input.setCustomValidity(t.invalidEmail);
      } else if (input.validity.typeMismatch && input.type === "tel") {
        input.setCustomValidity(t.invalidPhone);
      }
    });

    input.addEventListener("input", () => {
      input.setCustomValidity("");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll("input, select, textarea");
    let isFormValid = true;

    try {
      inputs.forEach((input) => {
        const isValid = input.checkValidity();
        const minLengthAttr = input.getAttribute("minlength");
        const isManualTooShort =
          minLengthAttr &&
          input.value.length > 0 &&
          input.value.length < parseInt(minLengthAttr);

        if (!isValid || isManualTooShort) {
          isFormValid = false;
          if (isManualTooShort || input.validity.tooShort) {
            input.setCustomValidity(t.tooShort(minLengthAttr || 2));
          } else if (input.validity.valueMissing) {
            input.setCustomValidity(t.required);
          } else if (input.type === "email") {
            input.setCustomValidity(t.invalidEmail);
          } else if (input.type === "tel") {
            input.setCustomValidity(t.invalidPhone);
          }
        } else {
          input.setCustomValidity("");
        }
      });

      if (!isFormValid) {
        form.reportValidity();
        return;
      }
    } catch (error) {
      return;
    }

    const btn = form.querySelector(".btn-submit");
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `${t.loading} <i data-lucide="loader-2" class="spin"></i>`;
    btn.style.background = "#2563EB";
    if (typeof lucide !== "undefined") lucide.createIcons();

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });

      const result = await response.json();

      if (response.status === 200) {
        btn.innerHTML = `${t.success} <i data-lucide="check"></i>`;
        btn.style.background = "#10B981";
        if (typeof lucide !== "undefined") lucide.createIcons();
        form.reset();
        showToast(t.thankYou, true);

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = "";
          btn.disabled = false;
          if (typeof lucide !== "undefined") lucide.createIcons();
        }, 4000);
      } else {
        btn.innerHTML = t.error;
        btn.style.background = "#EF4444";
        btn.disabled = false;
        showToast(t.sendError, false);
      }
    } catch (error) {
      btn.innerHTML = t.connError;
      btn.style.background = "#EF4444";
      btn.disabled = false;
      showToast(t.netError, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm("contactForm");
  setupForm("detailedForm");
});
