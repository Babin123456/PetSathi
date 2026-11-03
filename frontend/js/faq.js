/**
 * PetSathi - FAQ & Help Center Interactive Script
 * Provides search filtering, accordion expand/collapse, category tabs, and contact form handling.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const searchInput = document.getElementById("faq-search");
  const clearBtn = document.getElementById("faq-search-clear");
  const searchForm = document.getElementById("faq-search-form");
  const categoryPills = document.querySelectorAll(".faq-pill");
  const faqItems = document.querySelectorAll(".faq-item");
  const categoryBlocks = document.querySelectorAll(".faq-category-block");
  const toggleAllBtn = document.getElementById("faq-toggle-all");
  const statusCountEl = document.getElementById("faq-matches-count");
  const noResultsEl = document.getElementById("faq-no-results");
  const resetSearchBtn = document.getElementById("faq-reset-search");
  const contactForm = document.getElementById("faq-contact-form");
  const formSuccessAlert = document.getElementById("faq-form-success");
  const formErrorAlert = document.getElementById("faq-form-error");

  // State
  let currentCategory = "all";
  let currentSearchQuery = "";
  let isAllExpanded = false;

  // Initialize total count
  const totalCount = faqItems.length;
  updateStatusCount(totalCount, totalCount);

  // ========================================================
  // 1. ACCORDION EXPAND / COLLAPSE
  // ========================================================
  function toggleItem(item, forceOpen = null) {
    const btn = item.querySelector(".faq-question-btn");
    const panel = item.querySelector(".faq-answer-panel");
    if (!btn || !panel) return;

    const isOpen = forceOpen !== null ? forceOpen : !item.classList.contains("active");

    if (isOpen) {
      item.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = panel.scrollHeight + "px";
    } else {
      item.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
      panel.style.maxHeight = "0";
    }
  }

  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-question-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        toggleItem(item);
      });
    }
  });

  // Toggle All Button
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener("click", () => {
      isAllExpanded = !isAllExpanded;
      toggleAllBtn.textContent = isAllExpanded ? "Collapse All ↑" : "Expand All ↓";

      // Only toggle currently visible items
      faqItems.forEach((item) => {
        if (item.style.display !== "none") {
          toggleItem(item, isAllExpanded);
        }
      });
    });
  }

  // ========================================================
  // 2. SEARCH & FILTERING LOGIC
  // ========================================================
  function filterFAQs() {
    const query = currentSearchQuery.trim().toLowerCase();
    let visibleCount = 0;

    // Toggle clear button visibility
    if (clearBtn) {
      clearBtn.classList.toggle("visible", query.length > 0);
    }

    categoryBlocks.forEach((block) => {
      const blockCategory = block.dataset.category;
      const isCategoryMatch = currentCategory === "all" || currentCategory === blockCategory;
      let blockVisibleCount = 0;

      const itemsInBlock = block.querySelectorAll(".faq-item");
      itemsInBlock.forEach((item) => {
        const questionText = item.querySelector(".faq-question-text")?.textContent.toLowerCase() || "";
        const answerText = item.querySelector(".faq-answer-content")?.textContent.toLowerCase() || "";
        const keywords = item.dataset.keywords?.toLowerCase() || "";

        const textMatches = !query || questionText.includes(query) || answerText.includes(query) || keywords.includes(query);
        const shouldShow = isCategoryMatch && textMatches;

        if (shouldShow) {
          item.style.display = "block";
          blockVisibleCount++;
          visibleCount++;

          // Auto-expand items when searching with a query
          if (query.length >= 2) {
            toggleItem(item, true);
          }
        } else {
          item.style.display = "none";
          toggleItem(item, false);
        }
      });

      // Show/hide category block header based on whether any item inside is visible
      block.style.display = blockVisibleCount > 0 ? "block" : "none";
    });

    // Update status counter and no-results view
    updateStatusCount(visibleCount, totalCount, query);
    if (noResultsEl) {
      noResultsEl.classList.toggle("visible", visibleCount === 0);
    }
  }

  function updateStatusCount(visible, total, query = "") {
    if (!statusCountEl) return;
    if (query) {
      statusCountEl.innerHTML = `Found <em>${visible}</em> ${visible === 1 ? "result" : "results"} for &ldquo;${escapeHtml(query)}&rdquo;`;
    } else if (currentCategory !== "all") {
      const activePill = document.querySelector(`.faq-pill[data-category="${currentCategory}"]`);
      const catName = activePill ? activePill.childNodes[0].textContent.trim() : "Selected Category";
      statusCountEl.innerHTML = `Showing <em>${visible}</em> questions in <em>${catName}</em>`;
    } else {
      statusCountEl.innerHTML = `Showing all <em>${visible}</em> frequently asked questions`;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ========================================================
  // 3. SEARCH INPUT LISTENERS
  // ========================================================
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value;
      filterFAQs();
    });

    // Form submission prevention
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        filterFAQs();
      });
    }
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      currentSearchQuery = "";
      filterFAQs();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
      }
      currentSearchQuery = "";
      currentCategory = "all";
      categoryPills.forEach((p) => p.classList.toggle("active", p.dataset.category === "all"));
      filterFAQs();
    });
  }

  // ========================================================
  // 4. CATEGORY PILL TABS
  // ========================================================
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.category || "all";
      filterFAQs();

      // If specific category selected, scroll to it smoothly
      if (currentCategory !== "all") {
        const targetBlock = document.getElementById(`category-${currentCategory}`);
        if (targetBlock) {
          targetBlock.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // ========================================================
  // 5. DEEP LINKING VIA URL HASH
  // ========================================================
  const initialHash = window.location.hash;
  if (initialHash) {
    const targetEl = document.querySelector(initialHash);
    if (targetEl) {
      if (targetEl.classList.contains("faq-item")) {
        toggleItem(targetEl, true);
      }
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }

  // ========================================================
  // 6. CONTACT FORM INTERACTION
  // ========================================================
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("faq-contact-name");
      const emailInput = document.getElementById("faq-contact-email");
      const messageInput = document.getElementById("faq-contact-message");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !message) {
        if (formErrorAlert) {
          formErrorAlert.textContent = "Please fill in your name, email, and message.";
          formErrorAlert.style.display = "flex";
        }
        if (formSuccessAlert) formSuccessAlert.style.display = "none";
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (formErrorAlert) {
          formErrorAlert.textContent = "Please enter a valid email address.";
          formErrorAlert.style.display = "flex";
        }
        if (formSuccessAlert) formSuccessAlert.style.display = "none";
        return;
      }

      // Success feedback
      if (formErrorAlert) formErrorAlert.style.display = "none";
      if (formSuccessAlert) {
        formSuccessAlert.style.display = "flex";
      }

      contactForm.reset();

      setTimeout(() => {
        if (formSuccessAlert) formSuccessAlert.style.display = "none";
      }, 7000);
    });
  }
});
