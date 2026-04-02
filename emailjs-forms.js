const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

(function () {
  const isConfigured = ![
    EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
  ].some((value) => value.startsWith("YOUR_"));

  function setStatus(statusElement, message, type) {
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.classList.remove("is-success", "is-error");
    if (type) {
      statusElement.classList.add(type);
    }
  }

  function setButtonState(button, loading) {
    if (!button) return;
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent;
    }
    button.disabled = loading;
    button.classList.toggle("is-loading", loading);
    button.textContent = loading ? "Sending..." : button.dataset.defaultText;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll("[data-emailjs-form]");
    if (!forms.length) return;

    forms.forEach((form) => {
      const urlField = form.querySelector('input[name="page_url"]');
      if (urlField) {
        urlField.value = window.location.href;
      }
    });

    if (!window.emailjs || !isConfigured) {
      forms.forEach((form) => {
        const status = form.querySelector(".form-status");
        setStatus(
          status,
          "EmailJS is connected, but you still need to add your Public Key, Service ID, and Template ID in emailjs-forms.js.",
          "is-error"
        );
      });
      return;
    }

    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

    forms.forEach((form) => {
      const status = form.querySelector(".form-status");
      const submitButton = form.querySelector('button[type="submit"]');

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
          return;
        }

        setButtonState(submitButton, true);
        setStatus(status, "", "");

        try {
          await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
          form.reset();
          const urlField = form.querySelector('input[name="page_url"]');
          if (urlField) {
            urlField.value = window.location.href;
          }
          setStatus(status, "Thank you. Your message has been sent successfully.", "is-success");
        } catch (error) {
          console.error("EmailJS submission failed:", error);
          setStatus(status, "Something went wrong while sending your message. Please try again.", "is-error");
        } finally {
          setButtonState(submitButton, false);
        }
      });
    });
  });
})();
