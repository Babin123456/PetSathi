/**
 * PetSathi — Explore Pets Functionality (pets.js)
 * Provides interactive category filtering and real-time search
 * for frontend/pages/pets/index.html
 */

document.addEventListener("DOMContentLoaded", () => {
  const filterTabs = document.querySelectorAll(".filter-tab");
  const petCards = document.querySelectorAll(".pet-category-card");
  const searchInput = document.getElementById("petSearchInput");
  const noResults = document.getElementById("petsNoResults");
  const resetBtn = document.getElementById("resetFilterBtn");

  let activeCategory = "all";
  let searchQuery = "";

  function applyFilters() {
    let visibleCount = 0;

    petCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category") || "";
      const cardText = card.textContent.toLowerCase();

      const matchesCategory =
        activeCategory === "all" || cardCategory === activeCategory;
      const matchesSearch =
        searchQuery === "" || cardText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.classList.remove("hidden");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
    });

    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.add("visible");
      } else {
        noResults.classList.remove("visible");
      }
    }
  }

  // Filter tabs click handling
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

  // Real-time search handling
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Reset button handling
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      activeCategory = "all";
      searchQuery = "";
      if (searchInput) searchInput.value = "";

      filterTabs.forEach((t) => {
        const isAll = t.getAttribute("data-filter") === "all";
        t.classList.toggle("active", isAll);
        t.setAttribute("aria-pressed", isAll ? "true" : "false");
      });

      applyFilters();
    });
  }
});
