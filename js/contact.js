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

function setupForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    input.addEventListener("invalid", () => {
      if (input.validity.valueMissing) {
        input.setCustomValidity("Tämä kenttä on pakollinen.");
      } else if (input.validity.tooShort) {
        const minLength = input.getAttribute("minlength");
        input.setCustomValidity(
          `Tekstin pitää olla vähintään ${minLength} merkkiä pitkä.`,
        );
      } else if (
        (input.validity.typeMismatch || input.validity.patternMismatch) &&
        input.type === "email"
      ) {
        input.setCustomValidity(
          "Anna voimassa oleva sähköpostiosoite (esim. .com tai .fi).",
        );
      } else if (input.validity.typeMismatch && input.type === "tel") {
        input.setCustomValidity("Anna voimassa oleva puhelinnumero.");
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
            const minLength = minLengthAttr || 2;
            input.setCustomValidity(
              `Tekstin pitää olla vähintään ${minLength} merkkiä pitkä.`,
            );
          } else if (input.validity.valueMissing) {
            input.setCustomValidity("Tämä kenttä on pakollinen.");
          } else if (
            (input.validity.typeMismatch || input.validity.patternMismatch) &&
            input.type === "email"
          ) {
            input.setCustomValidity(
              "Anna voimassa oleva sähköpostiosoite (esim. .com tai .fi).",
            );
          } else if (input.validity.typeMismatch && input.type === "tel") {
            input.setCustomValidity("Anna voimassa oleva puhelinnumero.");
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

    inputs.forEach((input) => {
      if (!input.hasInputListener) {
        input.hasInputListener = true;
        input.addEventListener("input", () => {
          input.setCustomValidity("");
        });
      }
    });

    const btn = form.querySelector(".btn-submit");
    const originalText = btn.innerHTML;

    btn.disabled = true;

    btn.innerHTML = 'Lähetetään... <i data-lucide="loader-2" class="spin"></i>';
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
        btn.innerHTML = 'Viesti lähetetty! <i data-lucide="check"></i>';
        btn.style.background = "#10B981";
        if (typeof lucide !== "undefined") lucide.createIcons();
        form.reset();

        showToast("Kiitos viestistäsi! Olemme sinuun pian yhteydessä.", true);

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = "";
          btn.disabled = false;
          if (typeof lucide !== "undefined") lucide.createIcons();
        }, 4000);
      } else {
        console.error(result);
        btn.innerHTML = "Virhe! Yritä uudelleen.";
        btn.style.background = "#EF4444";
        btn.disabled = false;
        showToast("Viestin lähetyksessä tapahtui virhe. Yritä uudelleen myöhemmin.", false);
      }
    } catch (error) {
      console.error(error);
      btn.innerHTML = "Yhteysvirhe!";
      btn.style.background = "#EF4444";
      btn.disabled = false;
      showToast("Tapahtui yhteysvirhe. Tarkista verkkoyhteytesi.", false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm("contactForm");
  setupForm("detailedForm");
});
