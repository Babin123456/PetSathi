/**
 * ============================================================================
 * PetSathi - Contact Us Interactive Logic (frontend/js/contact.js)
 * Handles client-side form validation, real-time error states, character
 * counting, and animated success feedback without external dependencies.
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const successBanner = document.getElementById("contactSuccessBanner");
  const submitBtn = document.getElementById("submitBtn");
  const sendAnotherBtn = document.getElementById("sendAnotherBtn");
  const charCount = document.getElementById("charCount");

  // Form Fields
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const subjectSelect = document.getElementById("subject");
  const messageTextarea = document.getElementById("message");

  // Error Message Containers
  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const subjectError = document.getElementById("subjectError");
  const messageError = document.getElementById("messageError");

  if (!contactForm) return;

  // --------------------------------------------------------------------------
  // 1. Validation Helper Functions
  // --------------------------------------------------------------------------

  /**
   * Validates Full Name
   * Must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes.
   */
  function validateName(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "Please enter your full name.";
    }
    if (trimmed.length < 2) {
      return "Full name must be at least 2 characters long.";
    }
    // Allow letters (including international characters), spaces, hyphens, apostrophes, and periods
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.]+$/;
    if (!nameRegex.test(trimmed)) {
      return "Please enter a valid name using letters and spaces only.";
    }
    return "";
  }

  /**
   * Validates Email Address
   * Standard RFC 5322 compatible regex check.
   */
  function validateEmail(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address (e.g., name@example.com).";
    }
    return "";
  }

  /**
   * Validates Subject
   * Must select an option other than empty/placeholder.
   */
  function validateSubject(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "Please select a subject for your message.";
    }
    return "";
  }

  /**
   * Validates Message
   * Must be at least 10 characters long.
   */
  function validateMessage(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "Please write your message.";
    }
    if (trimmed.length < 10) {
      return `Your message is too short (${trimmed.length}/10 characters minimum).`;
    }
    if (trimmed.length > 1000) {
      return `Your message exceeds the 1,000 character limit (${trimmed.length}/1000).`;
    }
    return "";
  }

  /**
   * Helper to set or clear error on a form group
   */
  function setFieldError(inputEl, errorEl, errorMessage) {
    const group = inputEl.closest(".form-group");
    if (!group) return;

    if (errorMessage) {
      group.classList.add("has-error");
      inputEl.setAttribute("aria-invalid", "true");
      if (errorEl) {
        errorEl.textContent = errorMessage;
      }
    } else {
      group.classList.remove("has-error");
      inputEl.removeAttribute("aria-invalid");
      if (errorEl) {
        errorEl.textContent = "";
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. Real-Time Input Listeners & Character Counter
  // --------------------------------------------------------------------------

  // Full Name live validation
  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => {
      if (fullNameInput.closest(".form-group").classList.contains("has-error")) {
        setFieldError(fullNameInput, nameError, validateName(fullNameInput.value));
      }
    });
    fullNameInput.addEventListener("blur", () => {
      setFieldError(fullNameInput, nameError, validateName(fullNameInput.value));
    });
  }

  // Email live validation
  if (emailInput) {
    emailInput.addEventListener("input", () => {
      if (emailInput.closest(".form-group").classList.contains("has-error")) {
        setFieldError(emailInput, emailError, validateEmail(emailInput.value));
      }
    });
    emailInput.addEventListener("blur", () => {
      setFieldError(emailInput, emailError, validateEmail(emailInput.value));
    });
  }

  // Subject change validation
  if (subjectSelect) {
    subjectSelect.addEventListener("change", () => {
      setFieldError(subjectSelect, subjectError, validateSubject(subjectSelect.value));
    });
  }

  // Message character counter & live validation
  if (messageTextarea) {
    messageTextarea.addEventListener("input", () => {
      const len = messageTextarea.value.length;
      if (charCount) {
        charCount.textContent = String(len);
        if (len > 1000) {
          charCount.style.color = "var(--contact-error)";
        } else {
          charCount.style.color = "inherit";
        }
      }
      if (messageTextarea.closest(".form-group").classList.contains("has-error")) {
        setFieldError(messageTextarea, messageError, validateMessage(messageTextarea.value));
      }
    });
    messageTextarea.addEventListener("blur", () => {
      setFieldError(messageTextarea, messageError, validateMessage(messageTextarea.value));
    });
  }

  // --------------------------------------------------------------------------
  // 3. Form Submission Handling
  // --------------------------------------------------------------------------

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate all fields
    const nameErr = validateName(fullNameInput?.value);
    const emailErr = validateEmail(emailInput?.value);
    const subjectErr = validateSubject(subjectSelect?.value);
    const messageErr = validateMessage(messageTextarea?.value);

    setFieldError(fullNameInput, nameError, nameErr);
    setFieldError(emailInput, emailError, emailErr);
    setFieldError(subjectSelect, subjectError, subjectErr);
    setFieldError(messageTextarea, messageError, messageErr);

    // If any field has an error, focus the first one
    if (nameErr) {
      fullNameInput?.focus();
      return;
    }
    if (emailErr) {
      emailInput?.focus();
      return;
    }
    if (subjectErr) {
      subjectSelect?.focus();
      return;
    }
    if (messageErr) {
      messageTextarea?.focus();
      return;
    }

    // Capture submitted values for personalized confirmation
    const submittedName = fullNameInput.value.trim();
    const submittedEmail = emailInput.value.trim();
    const subjectText = subjectSelect.options[subjectSelect.selectedIndex]?.text || "Inquiry";

    // Show loading state on button
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>⏳ Sending message...</span>`;

      // Simulate network response
      setTimeout(() => {
        // Hide form and show success banner
        contactForm.classList.add("hidden");
        if (successBanner) {
          successBanner.classList.add("visible");

          // Update personalized message in banner if placeholder element exists
          const successDetails = document.getElementById("successDetails");
          if (successDetails) {
            successDetails.innerHTML = `Thank you, <strong>${escapeHtml(submittedName)}</strong>! We have received your message regarding "<em>${escapeHtml(subjectText)}</em>". Our team will reply to <strong>${escapeHtml(submittedEmail)}</strong> within 24 hours.`;
          }

          successBanner.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Reset submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 600);
    }
  });

  // --------------------------------------------------------------------------
  // 4. Send Another Message Reset Handler
  // --------------------------------------------------------------------------

  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener("click", () => {
      // Clear form inputs
      contactForm.reset();

      // Reset character count
      if (charCount) {
        charCount.textContent = "0";
        charCount.style.color = "inherit";
      }

      // Clear any remaining errors
      setFieldError(fullNameInput, nameError, "");
      setFieldError(emailInput, emailError, "");
      setFieldError(subjectSelect, subjectError, "");
      setFieldError(messageTextarea, messageError, "");

      // Swap visibility back to form
      if (successBanner) {
        successBanner.classList.remove("visible");
      }
      contactForm.classList.remove("hidden");

      // Focus first input for accessibility
      fullNameInput?.focus();
    });
  }

  // --------------------------------------------------------------------------
  // 5. Utility: Simple HTML Escaper
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
