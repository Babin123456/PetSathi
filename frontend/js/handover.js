/* =========================================
   PETSATHI WALK SAFETY & HANDOVER CHECKLIST
   Frontend demo with local persistence
========================================= */

(() => {
  "use strict";

  const STORAGE_PREFIX = "petsathi.walkHandover.v1.";
  const ACK_KEYS = ["identity", "equipment", "instructions", "emergency", "pickup"];
  const WALK_STATUSES = ["completed", "partially_completed", "not_completed"];
  const BEHAVIOURS = ["calm", "energetic", "anxious", "reactive", "other"];

  const BOOKINGS = {
    "PS-1042": {
      petName: "Max",
      breed: "Golden Retriever",
      ownerName: "Aarav Sharma",
      walkerName: "Riya K.",
      date: "Sat, 14 Nov 2026",
      time: "6:30 PM",
      area: "Kothrud, Pune",
      seed: {
        owner: {
          petName: "Max",
          petId: "Golden Retriever · Golden coat · 4 years",
          behaviour: "Friendly and excited around people. Pulls gently on the leash when he sees other dogs, so keep a short grip near crossings.",
          requirements: "30-minute walk around the neighbourhood park. Please carry water and avoid the busy main road.",
          emergencyName: "Aarav Sharma",
          emergencyPhone: "+91 98765 43210",
          precautions: "No treats from strangers. Max is allergic to chicken.",
          confirmed: true
        }
      }
    },
    "PS-1043": {
      petName: "Luna",
      breed: "Indie",
      ownerName: "Meera Joshi",
      walkerName: "Sahil P.",
      date: "Sun, 15 Nov 2026",
      time: "7:00 AM",
      area: "Baner, Pune",
      seed: {}
    },
    "PS-1044": {
      petName: "Coco",
      breed: "Beagle",
      ownerName: "Nikhil Rao",
      walkerName: "Aditi M.",
      date: "Tue, 10 Nov 2026",
      time: "5:45 PM",
      area: "Viman Nagar, Pune",
      seed: {
        owner: {
          petName: "Coco",
          petId: "Beagle · Tri-colour · 2 years",
          behaviour: "Calm on familiar routes but nervous around heavy traffic and loud construction noise.",
          requirements: "25-minute loop inside the society garden. Keep her away from the main road and offer water halfway.",
          emergencyName: "Nikhil Rao",
          emergencyPhone: "+91 90000 12345",
          precautions: "Coco is allergic to grass seeds. Check her paws after the walk.",
          confirmed: true
        },
        ack: {
          identity: true,
          equipment: true,
          instructions: true,
          emergency: true,
          pickup: true
        },
        post: {
          status: "completed",
          duration: 25,
          behaviour: "calm",
          incidents: "Stopped twice for water. No incidents, and Coco walked comfortably on the leash throughout.",
          handover: true
        }
      }
    }
  };

  const elements = {};
  let activeBookingId = "";
  let activeRole = "owner";
  let currentData = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function isValidPhone(value) {
    const phone = text(value);
    if (!/^[+\d][\d\s().-]*$/.test(phone)) return false;
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  function hasAnyOwnerData(owner) {
    if (!owner) return false;
    return Boolean(
      text(owner.petName) ||
      text(owner.petId) ||
      text(owner.behaviour) ||
      text(owner.requirements) ||
      text(owner.emergencyName) ||
      text(owner.emergencyPhone) ||
      text(owner.precautions) ||
      owner.confirmed
    );
  }

  function isOwnerComplete(owner) {
    return Boolean(
      owner &&
      owner.confirmed === true &&
      text(owner.petName).length >= 2 &&
      text(owner.petId).length >= 2 &&
      text(owner.behaviour).length >= 10 &&
      text(owner.requirements).length >= 5 &&
      text(owner.emergencyName).length >= 2 &&
      isValidPhone(owner.emergencyPhone)
    );
  }

  function isAckStarted(ack) {
    return Boolean(ack && ACK_KEYS.some(key => ack[key] === true));
  }

  function isAckComplete(ack) {
    return Boolean(ack && ACK_KEYS.every(key => ack[key] === true));
  }

  function isPostStarted(post) {
    if (!post) return false;
    return Boolean(
      post.status ||
      (post.duration !== "" && post.duration != null) ||
      post.behaviour ||
      text(post.incidents) ||
      post.handover
    );
  }

  function isPostComplete(post) {
    return Boolean(
      post &&
      WALK_STATUSES.includes(post.status) &&
      Number.isInteger(post.duration) &&
      post.duration >= 1 &&
      post.duration <= 480 &&
      BEHAVIOURS.includes(post.behaviour) &&
      post.handover === true
    );
  }

  function getStored(bookingId) {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + bookingId);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + activeBookingId,
        JSON.stringify(currentData)
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadDataFor(bookingId) {
    const seed = clone(BOOKINGS[bookingId].seed || {});
    const stored = getStored(bookingId);

    return {
      owner: Object.assign({}, seed.owner || {}, (stored && stored.owner) || {}),
      ack: Object.assign({}, seed.ack || {}, (stored && stored.ack) || {}),
      post: Object.assign({}, seed.post || {}, (stored && stored.post) || {})
    };
  }

  function cacheElements() {
    const ids = [
      "bookingSelect",
      "bookingMeta",
      "progressText",
      "progressPercent",
      "progressFill",
      "progressSteps",
      "stepOwnerState",
      "stepAckState",
      "stepPostState",
      "roleBanner",
      "ownerCard",
      "ownerForm",
      "ownerFieldset",
      "ownerConfirm",
      "ownerSummary",
      "ownerSummaryList",
      "ownerStatus",
      "ownerFeedback",
      "ackCard",
      "ackForm",
      "ackFieldset",
      "ackIdentity",
      "ackEquipment",
      "ackInstructions",
      "ackEmergency",
      "ackPickup",
      "ackItems",
      "ackLockedNote",
      "ackStatus",
      "ackFeedback",
      "postCard",
      "postForm",
      "postFieldset",
      "postLockedNote",
      "postStatus",
      "postFeedback"
    ];

    ids.forEach(id => {
      elements[id] = document.getElementById(id);
    });

    elements.roleButtons = Array.from(document.querySelectorAll(".role-btn"));
    elements.ackInputs = {
      identity: elements.ackIdentity,
      equipment: elements.ackEquipment,
      instructions: elements.ackInstructions,
      emergency: elements.ackEmergency,
      pickup: elements.ackPickup
    };
  }

  function setFieldValue(form, name, value) {
    const field = form.elements[name];
    if (field) field.value = value == null ? "" : String(value);
  }

  function readOwnerForm() {
    const form = elements.ownerForm;
    return {
      petName: text(form.elements.petName.value),
      petId: text(form.elements.petId.value),
      behaviour: text(form.elements.behaviour.value),
      requirements: text(form.elements.requirements.value),
      emergencyName: text(form.elements.emergencyName.value),
      emergencyPhone: text(form.elements.emergencyPhone.value),
      precautions: text(form.elements.precautions.value),
      confirmed: form.elements.ownerConfirm.checked
    };
  }

  function readAckForm() {
    const ack = {};
    ACK_KEYS.forEach(key => {
      ack[key] = Boolean(elements.ackInputs[key] && elements.ackInputs[key].checked);
    });
    return ack;
  }

  function readPostForm() {
    const form = elements.postForm;
    const durationRaw = text(form.elements.walkDuration.value);
    const duration = durationRaw === "" ? "" : Number(durationRaw);

    return {
      status: form.elements.walkStatus.value,
      duration: Number.isFinite(duration) ? duration : "",
      behaviour: form.elements.petBehaviour.value,
      incidents: text(form.elements.incidents.value),
      handover: form.elements.handoverConfirm.checked
    };
  }

  function populateForms() {
    const owner = currentData.owner || {};
    const post = currentData.post || {};

    [
      "petName",
      "petId",
      "behaviour",
      "requirements",
      "emergencyName",
      "emergencyPhone",
      "precautions"
    ].forEach(name => {
      setFieldValue(elements.ownerForm, name, owner[name] || "");
    });

    elements.ownerConfirm.checked = Boolean(owner.confirmed);

    ACK_KEYS.forEach(key => {
      if (elements.ackInputs[key]) {
        elements.ackInputs[key].checked = Boolean((currentData.ack || {})[key]);
      }
    });

    setFieldValue(elements.postForm, "walkStatus", post.status || "");
    setFieldValue(
      elements.postForm,
      "walkDuration",
      post.duration === "" || post.duration == null ? "" : post.duration
    );
    setFieldValue(elements.postForm, "petBehaviour", post.behaviour || "");
    setFieldValue(elements.postForm, "incidents", post.incidents || "");
    elements.postForm.elements.handoverConfirm.checked = Boolean(post.handover);
  }

  function renderBookingMeta() {
    const booking = BOOKINGS[activeBookingId];
    elements.bookingMeta.textContent = "";

    const pet = document.createElement("strong");
    pet.textContent = `${booking.petName} · ${booking.breed}`;

    elements.bookingMeta.append(
      pet,
      document.createElement("br"),
      document.createTextNode(`${booking.date} · ${booking.time} · ${booking.area}`),
      document.createElement("br"),
      document.createTextNode(`Owner: ${booking.ownerName} · Walker: ${booking.walkerName}`)
    );
  }

  function setStatusPill(element, label) {
    element.textContent = label;
    element.className = "status-pill";

    if (label === "Completed") {
      element.classList.add("is-complete");
    } else if (label === "In progress") {
      element.classList.add("is-progress");
    } else if (label === "Locked") {
      element.classList.add("is-locked");
    }
  }

  function setFeedback(element, message, type) {
    element.textContent = message;
    element.className = "checklist-feedback" + (type ? " is-" + type : "");
  }

  function clearFeedback() {
    [elements.ownerFeedback, elements.ackFeedback, elements.postFeedback].forEach(element => {
      setFeedback(element, "", null);
    });
  }

  function clearErrors(scope) {
    scope.querySelectorAll(".field-error").forEach(error => {
      error.textContent = "";
    });
    scope.querySelectorAll(".has-error").forEach(element => {
      element.classList.remove("has-error");
    });
  }

  function setFieldError(form, name, message, wrapperSelector) {
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (error) error.textContent = message;

    let wrapper = wrapperSelector ? form.querySelector(wrapperSelector) : null;

    if (!wrapper) {
      const field = form.querySelector(`[name="${name}"]`);
      wrapper = field ? field.closest(".form-field") : null;
    }

    if (wrapper) {
      wrapper.classList.toggle("has-error", Boolean(message));
    }
  }

  function focusFirstError(form) {
    const first = form.querySelector(
      ".form-field.has-error input:not([type='checkbox']), " +
      ".form-field.has-error select, " +
      ".form-field.has-error textarea, " +
      ".check-field.has-error input, " +
      ".checklist-items.has-error input"
    );

    if (first) first.focus();
  }

  function validateOwner() {
    clearErrors(elements.ownerForm);
    const owner = readOwnerForm();
    let valid = true;

    const fail = (name, message) => {
      setFieldError(elements.ownerForm, name, message);
      valid = false;
    };

    if (owner.petName.length < 2) {
      fail("petName", "Enter your pet's name (at least 2 characters).");
    } else if (owner.petName.length > 40) {
      fail("petName", "Pet name must be 40 characters or fewer.");
    }

    if (owner.petId.length < 2) {
      fail("petId", "Add an identifying detail such as breed, colour, age, or tag number.");
    } else if (owner.petId.length > 80) {
      fail("petId", "Pet identification must be 80 characters or fewer.");
    }

    if (owner.behaviour.length < 10) {
      fail("behaviour", "Describe your pet's behaviour in at least 10 characters.");
    } else if (owner.behaviour.length > 500) {
      fail("behaviour", "Behaviour notes must be 500 characters or fewer.");
    }

    if (owner.requirements.length < 5) {
      fail("requirements", "Describe the walking requirements in at least 5 characters.");
    } else if (owner.requirements.length > 500) {
      fail("requirements", "Walking requirements must be 500 characters or fewer.");
    }

    if (owner.emergencyName.length < 2) {
      fail("emergencyName", "Enter the emergency contact's full name.");
    } else if (owner.emergencyName.length > 60) {
      fail("emergencyName", "Emergency contact name must be 60 characters or fewer.");
    }

    if (!owner.emergencyPhone) {
      fail("emergencyPhone", "Add an emergency contact number.");
    } else if (!isValidPhone(owner.emergencyPhone)) {
      fail("emergencyPhone", "Enter a valid number with 7 to 15 digits.");
    }

    if (owner.precautions.length > 400) {
      fail("precautions", "Precautions must be 400 characters or fewer.");
    }

    if (!owner.confirmed) {
      fail("ownerConfirm", "Please confirm that these instructions are accurate.");
    }

    return valid;
  }

  function validateAck() {
    clearErrors(elements.ackForm);
    const ack = readAckForm();

    if (!ACK_KEYS.every(key => ack[key])) {
      setFieldError(
        elements.ackForm,
        "ack",
        "Please confirm all five safety checks before continuing.",
        "#ackItems"
      );
      return false;
    }

    return true;
  }

  function validatePost() {
    clearErrors(elements.postForm);
    const post = readPostForm();
    let valid = true;

    const fail = (name, message) => {
      setFieldError(elements.postForm, name, message);
      valid = false;
    };

    if (!WALK_STATUSES.includes(post.status)) {
      fail("walkStatus", "Select the walk completion status.");
    }

    if (
      post.duration === "" ||
      !Number.isInteger(post.duration) ||
      post.duration < 1 ||
      post.duration > 480
    ) {
      fail("walkDuration", "Enter a duration between 1 and 480 minutes.");
    }

    if (!BEHAVIOURS.includes(post.behaviour)) {
      fail("petBehaviour", "Select the pet's general behaviour after the walk.");
    }

    if (post.incidents.length > 500) {
      fail("incidents", "Incident notes must be 500 characters or fewer.");
    }

    if (!post.handover) {
      fail("handoverConfirm", "Confirm that the pet was safely handed over.");
    }

    return valid;
  }

  function setStep(stepName, state) {
    const item = elements.progressSteps.querySelector(`[data-step="${stepName}"]`);
    if (!item) return;

    item.classList.remove("is-complete", "is-progress", "is-locked");

    const dot = item.querySelector(".step-dot");
    const copy = item.querySelector("small");
    const numbers = { owner: "1", ack: "2", post: "3" };

    if (state === "complete") {
      item.classList.add("is-complete");
      dot.textContent = "✓";
      copy.textContent = "Completed";
    } else {
      dot.textContent = numbers[stepName];
      if (state === "progress") {
        item.classList.add("is-progress");
        copy.textContent = "In progress";
      } else if (state === "locked") {
        item.classList.add("is-locked");
        copy.textContent = "Locked";
      } else {
        copy.textContent = "Pending";
      }
    }
  }

  function updateProgress() {
    const ownerComplete = isOwnerComplete(currentData.owner);
    const ackComplete = isAckComplete(currentData.ack);
    const postComplete = isPostComplete(currentData.post);

    const ownerState = ownerComplete
      ? "complete"
      : hasAnyOwnerData(currentData.owner)
        ? "progress"
        : "pending";

    const ackState = ackComplete
      ? "complete"
      : !ownerComplete
        ? "locked"
        : isAckStarted(currentData.ack)
          ? "progress"
          : "pending";

    const postState = postComplete
      ? "complete"
      : !ackComplete
        ? "locked"
        : isPostStarted(currentData.post)
          ? "progress"
          : "pending";

    setStep("owner", ownerState);
    setStep("ack", ackState);
    setStep("post", postState);

    const completed = [ownerComplete, ackComplete, postComplete].filter(Boolean).length;
    const percent = Math.round((completed / 3) * 100);

    elements.progressText.textContent = `${completed} of 3 stages complete`;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressFill.style.width = `${percent}%`;
  }

  function updateStatuses() {
    const ownerComplete = isOwnerComplete(currentData.owner);
    const ackComplete = isAckComplete(currentData.ack);
    const postComplete = isPostComplete(currentData.post);

    setStatusPill(
      elements.ownerStatus,
      ownerComplete
        ? "Completed"
        : hasAnyOwnerData(currentData.owner)
          ? "In progress"
          : "Pending"
    );

    setStatusPill(
      elements.ackStatus,
      ackComplete
        ? "Completed"
        : !ownerComplete
          ? "Locked"
          : isAckStarted(currentData.ack)
            ? "In progress"
            : "Pending"
    );

    setStatusPill(
      elements.postStatus,
      postComplete
        ? "Completed"
        : !ackComplete
          ? "Locked"
          : isPostStarted(currentData.post)
            ? "In progress"
            : "Pending"
    );
  }

  function renderOwnerSummary(visible) {
    elements.ownerSummary.hidden = !visible;
    elements.ownerSummaryList.textContent = "";

    if (!visible) return;

    const owner = currentData.owner || {};
    const rows = [
      ["Pet", `${owner.petName} · ${owner.petId}`],
      ["Behaviour", owner.behaviour],
      ["Walk plan", owner.requirements],
      ["Emergency", `${owner.emergencyName} · ${owner.emergencyPhone}`]
    ];

    if (text(owner.precautions)) {
      rows.push(["Precautions", owner.precautions]);
    }

    rows.forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;

      const description = document.createElement("dd");
      description.textContent = value;

      elements.ownerSummaryList.append(term, description);
    });
  }

  function updateRoleBanner(ownerComplete, ackComplete) {
    if (activeRole === "owner") {
      elements.roleBanner.textContent =
        "Owner view: edit the pre-walk instructions below. Walker-only sections stay read-only.";
      return;
    }

    if (!ownerComplete) {
      elements.roleBanner.textContent =
        "Walker view: waiting for the owner to save the pre-walk instructions.";
    } else if (!ackComplete) {
      elements.roleBanner.textContent =
        "Walker view: review the owner's instructions and tick every safety check before the walk.";
    } else {
      elements.roleBanner.textContent =
        "Walker view: acknowledgement complete. Add the post-walk report after returning the pet.";
    }
  }

  function updateGates() {
    const ownerComplete = isOwnerComplete(currentData.owner);
    const ackComplete = isAckComplete(currentData.ack);
    const postComplete = isPostComplete(currentData.post);

    const ownerEditable = activeRole === "owner";
    const ackEditable = activeRole === "walker" && ownerComplete;
    const postEditable = activeRole === "walker" && ackComplete;

    elements.ownerFieldset.disabled = !ownerEditable;
    elements.ackFieldset.disabled = !ackEditable;
    elements.postFieldset.disabled = !postEditable;

    elements.ownerCard.classList.toggle("is-readonly", !ownerEditable);
    elements.ackCard.classList.toggle("is-locked", !ackEditable && !ackComplete);
    elements.postCard.classList.toggle("is-locked", !postEditable && !postComplete);

    elements.ackLockedNote.hidden = ackEditable || ackComplete;
    if (!ackEditable && !ackComplete) {
      elements.ackLockedNote.querySelector("span").textContent = ownerComplete
        ? "Switch to Walker view to acknowledge these instructions."
        : "Waiting for the owner to save pre-walk instructions.";
    }

    elements.postLockedNote.hidden = postEditable || postComplete;
    if (!postEditable && !postComplete) {
      elements.postLockedNote.querySelector("span").textContent = !ownerComplete
        ? "Waiting for the owner to save pre-walk instructions."
        : !ackComplete
          ? "Complete the pre-walk acknowledgement before submitting the report."
          : "Switch to Walker view to submit the post-walk report.";
    }

    renderOwnerSummary(ownerComplete);
    updateRoleBanner(ownerComplete, ackComplete);
  }

  function refreshDerived() {
    updateProgress();
    updateStatuses();
    updateGates();
  }

  function updateRoleButtons() {
    elements.roleButtons.forEach(button => {
      const active = button.dataset.role === activeRole;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function openBooking(bookingId) {
    activeBookingId = bookingId;
    currentData = loadDataFor(bookingId);

    elements.bookingSelect.value = bookingId;
    renderBookingMeta();
    populateForms();
    clearErrors(elements.ownerForm);
    clearErrors(elements.ackForm);
    clearErrors(elements.postForm);
    clearFeedback();
    refreshDerived();
    updateRoleButtons();

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("booking", bookingId);
      window.history.replaceState(null, "", url.toString());
    } catch (error) {
      /* URL updates are optional on file:// previews. */
    }
  }

  function handleOwnerDraft(event) {
    if (elements.ownerFieldset.disabled) return;

    currentData.owner = readOwnerForm();
    persist();

    if (event && event.target && event.target.name) {
      setFieldError(elements.ownerForm, event.target.name, "");
    }

    setFeedback(elements.ownerFeedback, "", null);
    refreshDerived();
  }

  function handleAckDraft() {
    if (elements.ackFieldset.disabled) return;

    currentData.ack = readAckForm();
    persist();
    setFieldError(elements.ackForm, "ack", "", "#ackItems");
    setFeedback(elements.ackFeedback, "", null);
    refreshDerived();
  }

  function handlePostDraft(event) {
    if (elements.postFieldset.disabled) return;

    currentData.post = readPostForm();
    persist();

    if (event && event.target && event.target.name) {
      setFieldError(elements.postForm, event.target.name, "");
    }

    setFeedback(elements.postFeedback, "", null);
    refreshDerived();
  }

  function bindEvents() {
    elements.bookingSelect.addEventListener("change", event => {
      openBooking(event.target.value);
    });

    elements.roleButtons.forEach(button => {
      button.addEventListener("click", () => {
        activeRole = button.dataset.role;
        updateRoleButtons();
        updateGates();
      });
    });

    elements.ownerForm.addEventListener("input", handleOwnerDraft);
    elements.ownerForm.addEventListener("change", handleOwnerDraft);

    elements.ackForm.addEventListener("change", handleAckDraft);

    elements.postForm.addEventListener("input", handlePostDraft);
    elements.postForm.addEventListener("change", handlePostDraft);

    elements.ownerForm.addEventListener("submit", event => {
      event.preventDefault();
      if (activeRole !== "owner") return;

      if (!validateOwner()) {
        focusFirstError(elements.ownerForm);
        return;
      }

      currentData.owner = readOwnerForm();
      persist();
      setFeedback(
        elements.ownerFeedback,
        `Pre-walk instructions saved for ${BOOKINGS[activeBookingId].petName}. The assigned walker can now acknowledge them.`,
        "success"
      );
      refreshDerived();
    });

    elements.ackForm.addEventListener("submit", event => {
      event.preventDefault();
      if (activeRole !== "walker") return;

      if (!isOwnerComplete(currentData.owner)) {
        setFeedback(
          elements.ackFeedback,
          "Owner instructions must be saved before the walker can acknowledge them.",
          "error"
        );
        return;
      }

      if (!validateAck()) {
        focusFirstError(elements.ackForm);
        return;
      }

      currentData.ack = readAckForm();
      persist();
      setFeedback(
        elements.ackFeedback,
        "Walker acknowledgement saved. All safety checks are confirmed for this walk.",
        "success"
      );
      refreshDerived();
    });

    elements.postForm.addEventListener("submit", event => {
      event.preventDefault();
      if (activeRole !== "walker") return;

      if (!isAckComplete(currentData.ack)) {
        setFeedback(
          elements.postFeedback,
          "Complete the pre-walk acknowledgement before submitting the report.",
          "error"
        );
        return;
      }

      if (!validatePost()) {
        focusFirstError(elements.postForm);
        return;
      }

      currentData.post = readPostForm();
      persist();
      setFeedback(
        elements.postFeedback,
        `Post-walk report saved for ${BOOKINGS[activeBookingId].petName}. The owner can review it in the booking details.`,
        "success"
      );
      refreshDerived();
    });
  }

  function buildBookingOptions() {
    Object.keys(BOOKINGS).forEach(bookingId => {
      const option = document.createElement("option");
      option.value = bookingId;
      option.textContent = `${bookingId} · ${BOOKINGS[bookingId].petName}`;
      elements.bookingSelect.append(option);
    });
  }

  function firstBookingFromUrl() {
    try {
      const requested = new URLSearchParams(window.location.search).get("booking");
      if (requested && BOOKINGS[requested]) return requested;
    } catch (error) {
      /* Ignore malformed preview URLs. */
    }

    return Object.keys(BOOKINGS)[0];
  }

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();

    if (!elements.ownerForm || !elements.ackForm || !elements.postForm) return;

    buildBookingOptions();
    bindEvents();
    openBooking(firstBookingFromUrl());
  });
})();
