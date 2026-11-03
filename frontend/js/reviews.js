/* =========================================
   PETSATHI REVIEWS & RATINGS
   Frontend-only demo functionality
========================================= */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    // DOM ELEMENTS

    const reviewGrid = document.getElementById("reviewGrid");
    const filterSelect = document.getElementById("reviewFilter");
    const emptyState = document.getElementById("emptyReviews");
    const visibleCount = document.getElementById("visibleReviewCount");

    const averageRating = document.getElementById("averageRating");
    const averageStars = document.getElementById("averageStars");
    const reviewCount = document.getElementById("reviewCount");

    const form = document.getElementById("reviewForm");

    // Stop safely if the expected page elements do not exist.
    if (!reviewGrid || !form) return;

    const nameInput = document.getElementById("reviewerName");
    const messageInput = document.getElementById("reviewMessage");
    const messageCount = document.getElementById("messageCount");

    const ratingHint = document.getElementById("ratingHint");
    const successMessage = document.getElementById("formSuccess");

    // LOAD SAMPLE REVIEWS

    const initialCards = Array.from(
      reviewGrid.querySelectorAll(".review-card")
    );

    const reviews = initialCards.map((card, index) => ({
      element: card,
      rating: Number(card.dataset.rating),
      date: card.dataset.reviewDate || "2026-01-01",
      order: index
    }));

    let nextOrder = reviews.length;

    const starLabels = {
      1: "1 star — needs improvement",
      2: "2 stars — fair",
      3: "3 stars — good",
      4: "4 stars — very good",
      5: "5 stars — excellent"
    };

    // GET SELECTED RATING

    function getSelectedRating() {
      const selected = form.querySelector(
        'input[name="rating"]:checked'
      );

      return selected ? Number(selected.value) : 0;
    }

    // GENERATE USER INITIALS

    function getInitials(name) {
      return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("") || "P";
    }

    // FIELD ERROR HANDLING

    function setFieldError(field, message, errorId) {
      const wrapper = field.closest(".form-field");
      const error = document.getElementById(errorId);

      if (wrapper) {
        wrapper.classList.toggle("has-error", Boolean(message));
      }

      if (error) {
        error.textContent = message;
      }
    }

    // CHARACTER COUNTER

    function updateMessageCount() {
      if (messageCount) {
        messageCount.textContent =
          `${messageInput.value.length}/500`;
      }
    }

    // UPDATE OVERALL RATING

    function updateRatingSummary() {

      const total = reviews.length;

      const sum = reviews.reduce(
        (value, review) => value + review.rating,
        0
      );

      const average = total ? sum / total : 0;

      averageRating.textContent = total
        ? average.toFixed(1)
        : "0.0";

      averageStars.textContent =
        "★".repeat(Math.round(average)) +
        "☆".repeat(5 - Math.round(average));

      averageStars.setAttribute(
        "aria-label",
        `Average rating ${average.toFixed(1)} out of 5`
      );

      reviewCount.textContent =
        `${total} ${total === 1 ? "sample review" : "sample reviews"}`;

      // UPDATE RATING DISTRIBUTION

      for (let value = 5; value >= 1; value -= 1) {

        const matching = reviews.filter(
          review => review.rating === value
        ).length;

        const row = document.querySelector(
          `[data-rating-row="${value}"]`
        );

        if (!row) continue;

        const fill = row.querySelector(".rating-fill");
        const count = row.querySelector("strong");

        if (fill) {
          fill.style.width = total
            ? `${(matching / total) * 100}%`
            : "0%";
        }

        if (count) {
          count.textContent = String(matching);
        }
      }
    }

    // FILTER REVIEWS

    function applyFilter() {

      const filter = filterSelect
        ? filterSelect.value
        : "all";

      const visible = reviews.filter(review => {
        return filter === "all" ||
          String(review.rating) === filter;
      });

      reviews.forEach(review => {
        review.element.hidden = !visible.includes(review);
      });

      if (emptyState) {
        emptyState.hidden = visible.length !== 0;
      }

      if (visibleCount) {
        visibleCount.textContent =
          `Showing ${visible.length} ${
            visible.length === 1 ? "review" : "reviews"
          }${
            filter === "all"
              ? ""
              : ` · ${filter} star${filter === "1" ? "" : "s"}`
          }`;
      }
    }

    // CREATE A NEW REVIEW CARD

    function makeReviewCard(name, rating, message) {

      const article = document.createElement("article");

      article.className = "review-card";
      article.dataset.rating = String(rating);

      const today = new Date();

      const dateText = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      const dateValue = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
      ].join("-");

      article.dataset.reviewDate = dateValue;

      // TOP SECTION

      const top = document.createElement("div");
      top.className = "review-card-top";

      const profile = document.createElement("div");
      profile.className = "reviewer-profile";

      const avatar = document.createElement("div");
      avatar.className = "review-avatar avatar-user";
      avatar.setAttribute("role", "img");
      avatar.setAttribute("aria-label", `${name} avatar`);
      avatar.textContent = getInitials(name);

      const identity = document.createElement("div");

      const heading = document.createElement("h3");
      heading.textContent = name;

      const service = document.createElement("span");
      service.className = "review-service";
      service.textContent = "Community review";

      identity.append(heading, service);
      profile.append(avatar, identity);

      const date = document.createElement("span");
      date.className = "review-date";

      const time = document.createElement("time");
      time.dateTime = dateValue;
      time.textContent = dateText;

      date.append(time);
      top.append(profile, date);

      // RATING SECTION

      const ratingLine = document.createElement("div");

      ratingLine.className = "review-card-rating";

      ratingLine.setAttribute(
        "aria-label",
        `${rating} out of 5 stars`
      );

      const stars = document.createElement("span");

      stars.textContent =
        "★".repeat(rating) +
        "☆".repeat(5 - rating);

      const score = document.createElement("b");
      score.textContent = `${rating}.0`;

      ratingLine.append(stars, score);

      // REVIEW MESSAGE

      const paragraph = document.createElement("p");

      paragraph.className = "review-text";

      // textContent prevents user-entered HTML from being executed.
      paragraph.textContent = message;

      // CARD FOOTER

      const footer = document.createElement("div");
      footer.className = "review-card-footer";

      const label = document.createElement("span");
      label.textContent = "🐾 Visitor-submitted demo";

      const note = document.createElement("span");
      note.className = "helpful-mark";
      note.textContent = "♥ Frontend only";

      footer.append(label, note);

      article.append(
        top,
        ratingLine,
        paragraph,
        footer
      );

      return article;
    }

    // VALIDATE FORM

    function validateForm() {

      let valid = true;

      const name = nameInput.value.trim();
      const rating = getSelectedRating();
      const message = messageInput.value.trim();

      // NAME VALIDATION

      if (name.length < 2) {

        setFieldError(
          nameInput,
          "Please enter a name with at least 2 characters.",
          "nameError"
        );

        valid = false;

      } else if (name.length > 50) {

        setFieldError(
          nameInput,
          "Name must be 50 characters or fewer.",
          "nameError"
        );

        valid = false;

      } else {

        setFieldError(
          nameInput,
          "",
          "nameError"
        );

      }

      // RATING VALIDATION

      const ratingError = document.getElementById("ratingError");

      if (!rating) {

        if (ratingError) {
          ratingError.textContent =
            "Please choose a star rating.";
        }

        valid = false;

      } else if (ratingError) {

        ratingError.textContent = "";

      }

      // MESSAGE VALIDATION

      if (message.length < 15) {

        setFieldError(
          messageInput,
          "Please write at least 15 characters.",
          "messageError"
        );

        valid = false;

      } else if (message.length > 500) {

        setFieldError(
          messageInput,
          "Review must be 500 characters or fewer.",
          "messageError"
        );

        valid = false;

      } else {

        setFieldError(
          messageInput,
          "",
          "messageError"
        );

      }

      return valid;
    }

    // FILTER EVENT

    if (filterSelect) {
      filterSelect.addEventListener(
        "change",
        applyFilter
      );
    }

    // STAR SELECTION EVENTS

    form.querySelectorAll('input[name="rating"]').forEach(input => {

      input.addEventListener("change", () => {

        const rating = getSelectedRating();

        if (ratingHint) {
          ratingHint.textContent =
            starLabels[rating] || "Select a star rating.";
        }

        const error = document.getElementById("ratingError");

        if (error) {
          error.textContent = "";
        }

      });

    });

    // CLEAR FIELD ERRORS WHILE TYPING

    [nameInput, messageInput].forEach(field => {

      field.addEventListener("input", () => {

        const errorId = field === nameInput
          ? "nameError"
          : "messageError";

        if (field.value.trim()) {
          setFieldError(field, "", errorId);
        }

      });

    });

    // CHARACTER COUNTER EVENT

    messageInput.addEventListener(
      "input",
      updateMessageCount
    );

    // FORM SUBMISSION

    form.addEventListener("submit", event => {

      event.preventDefault();

      // Stop if validation fails.
      if (!validateForm()) {

        const firstInvalid = form.querySelector(
          ".has-error input, .has-error textarea"
        );

        if (firstInvalid) {
          firstInvalid.focus();
        }

        return;
      }

      const name = nameInput.value.trim();
      const rating = getSelectedRating();
      const message = messageInput.value.trim();

      // Generate a new review card.
      const card = makeReviewCard(
        name,
        rating,
        message
      );

      // Add the new card to the top of the page.
      reviewGrid.prepend(card);

      // Update local review data.
      reviews.unshift({
        element: card,
        rating,
        date: card.dataset.reviewDate,
        order: nextOrder++
      });

      // Update the overall score and distribution.
      updateRatingSummary();

      // Reset filter to show the new review.
      if (filterSelect) {
        filterSelect.value = "all";
      }

      applyFilter();

      // Clear the form.
      form.reset();

      updateMessageCount();

      if (ratingHint) {
        ratingHint.textContent = "Select a star rating.";
      }

      // Show success message.
      if (successMessage) {

        successMessage.hidden = false;

        successMessage.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

      }

    });

    // INITIALIZE PAGE

    updateMessageCount();
    updateRatingSummary();
    applyFilter();

  });

})();