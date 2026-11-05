/**
 * PetSathi — Services Page Functionality (services.js)
 * Provides interactive category filtering, live search, reset handlers,
 * and accessible FAQ accordion behavior for frontend/pages/services.html
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------------------
  // 1. Service Cards Filtering & Real-time Search
  // -------------------------------------------------------------------------
  const filterTabs = document.querySelectorAll(".filter-tab");
  const serviceCards = document.querySelectorAll(".service-card");
  const searchInput = document.getElementById("serviceSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const noResults = document.getElementById("servicesNoResults");
  const resetBtn = document.getElementById("resetFilterBtn");

  let activeCategory = "all";
  let searchQuery = "";

  function applyFilters() {
    let visibleCount = 0;

    serviceCards.forEach((card) => {
      const cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
      const cardTags = (card.getAttribute("data-tags") || "").toLowerCase();
      const cardTitle = (card.querySelector(".service-card-title")?.textContent || "").toLowerCase();
      const cardDesc = (card.querySelector(".service-card-desc")?.textContent || "").toLowerCase();

      const combinedText = `${cardTitle} ${cardDesc} ${cardTags} ${cardCategory}`;

      const matchesCategory =
        activeCategory === "all" || cardCategory === activeCategory;
      const matchesSearch =
        searchQuery === "" || combinedText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.classList.remove("hidden");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
    });

    // Update No Results display
    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.add("visible");
      } else {
        noResults.classList.remove("visible");
      }
    }

    // Toggle clear search button visibility
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchQuery ? "grid" : "none";
    }
  }

  // Filter Tabs Event Listeners
  if (filterTabs.length > 0) {
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-pressed", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-pressed", "true");

        activeCategory = tab.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });
  }

  // Live Search Event Listener
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });

    // Pressing Escape clears search
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchQuery = "";
        applyFilters();
      }
    });
  }

  // Clear Search Button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      searchQuery = "";
      applyFilters();
    });
  }

  // Reset All Filters Button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      activeCategory = "all";
      searchQuery = "";
      if (searchInput) searchInput.value = "";

      filterTabs.forEach((tab) => {
        const isAll = tab.getAttribute("data-filter") === "all";
        tab.classList.toggle("active", isAll);
        tab.setAttribute("aria-pressed", isAll ? "true" : "false");
      });

      applyFilters();
    });
  }

  // -------------------------------------------------------------------------
  // 2. Interactive Accessible FAQ Accordion
  // -------------------------------------------------------------------------
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const answer = item?.querySelector(".faq-answer");
      if (!item || !answer) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      // Optional: Close other open accordion items for clean accordion behavior
      document.querySelectorAll(".faq-item").forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          const otherBtn = otherItem.querySelector(".faq-question");
          const otherAnswer = otherItem.querySelector(".faq-answer");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isExpanded) {
        item.classList.remove("active");
        button.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("active");
        button.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Smooth scroll for internal links
  // -------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
});

