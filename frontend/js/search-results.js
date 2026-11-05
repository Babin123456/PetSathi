document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const clearSearchButton = document.getElementById("clear-search");

  const resultsGrid = document.getElementById("results-grid");
  const resultsHeading = document.getElementById("results-heading");
  const resultsCount = document.getElementById("results-count");

  const categoryButtons = document.querySelectorAll(".category-filter");
  const sortSelect = document.getElementById("sort-select");

  const noResults = document.getElementById("no-results");
  const resetButton = document.getElementById("reset-search");

  const suggestionButtons = document.querySelectorAll("[data-suggestion]");

  if (
    !searchForm ||
    !searchInput ||
    !resultsGrid ||
    !resultsHeading ||
    !resultsCount
  ) {
    console.error("PetSathi search page: Required elements were not found.");
    return;
  }

  const resultCards = Array.from(
    resultsGrid.querySelectorAll(".search-result-card")
  );

  let activeCategory = "all";

  // Read the initial search keyword from the URL.
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q") || "";

  searchInput.value = initialQuery;

  // Normalize text for case-insensitive searching.
  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  // Get the search keywords from a result card.
  function getCardSearchText(card) {
    const title =
      card.querySelector("h3")?.textContent || "";

    const description =
      card.querySelector(".result-card-body p")?.textContent || "";

    const keywords =
      card.dataset.search || "";

    return normalizeText(
      `${title} ${description} ${keywords} ${card.dataset.category || ""}`
    );
  }

  // Calculate a simple relevance score.
  function calculateRelevance(card, tokens) {
    const title = normalizeText(
      card.querySelector("h3")?.textContent || ""
    );

    const searchText = getCardSearchText(card);

    return tokens.reduce((score, token) => {
      if (title.includes(token)) {
        return score + 5;
      }

      if (searchText.includes(token)) {
        return score + 2;
      }

      return score;
    }, 0);
  }

  // Update the URL without refreshing the page.
  function updateSearchURL(query) {
    const url = new URL(window.location.href);

    if (query.trim()) {
      url.searchParams.set("q", query.trim());
    } else {
      url.searchParams.delete("q");
    }

    window.history.replaceState({}, "", url);
  }

  // Update active category button styling and accessibility state.
  function updateCategoryButtons() {
    categoryButtons.forEach((button) => {
      const isActive =
        button.dataset.category === activeCategory;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  // Update the page heading based on the search term.
  function updateHeading(query) {
    if (query) {
      resultsHeading.textContent = `Results for "${query}"`;
    } else {
      resultsHeading.textContent =
        "Find the right guide for your pet.";
    }
  }

  // Show or hide the clear-search button.
  function updateClearButton(query) {
    clearSearchButton.classList.toggle(
      "visible",
      Boolean(query)
    );
  }

  // Main search, filtering and sorting function.
  function renderResults() {
    const query = normalizeText(searchInput.value);

    const tokens = query
      .split(" ")
      .filter(Boolean);

    const sortMode = sortSelect.value;

    let matchingCards = [];

    resultCards.forEach((card) => {
      const cardCategory = card.dataset.category;
      const cardText = getCardSearchText(card);

      const categoryMatches =
        activeCategory === "all" ||
        cardCategory === activeCategory;

      const searchMatches =
        tokens.length === 0 ||
        tokens.every((token) => cardText.includes(token));

      const isVisible =
        categoryMatches && searchMatches;

      card.hidden = !isVisible;

      if (isVisible) {
        matchingCards.push(card);
      }
    });

    // Sorting.
    matchingCards.sort((a, b) => {
      const titleA = normalizeText(
        a.querySelector("h3")?.textContent || ""
      );

      const titleB = normalizeText(
        b.querySelector("h3")?.textContent || ""
      );

      if (sortMode === "az") {
        return titleA.localeCompare(titleB);
      }

      if (sortMode === "za") {
        return titleB.localeCompare(titleA);
      }

      if (tokens.length > 0) {
        const scoreA = calculateRelevance(a, tokens);
        const scoreB = calculateRelevance(b, tokens);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
      }

      // Preserve the original order when relevance is equal.
      return (
        Number(a.dataset.order) -
        Number(b.dataset.order)
      );
    });

    // Reorder matching cards in the DOM.
    matchingCards.forEach((card) => {
      resultsGrid.appendChild(card);
    });

    // Update the heading, count and empty state.
    updateHeading(query);
    updateClearButton(query);
    updateCategoryButtons();

    const totalResults = matchingCards.length;

    if (totalResults === 0) {
      resultsCount.textContent = "No matching guides found.";
      noResults.hidden = false;
      resultsGrid.hidden = true;
    } else {
      resultsGrid.hidden = false;
      noResults.hidden = true;

      if (query) {
        resultsCount.textContent =
          `Found ${totalResults} helpful result${totalResults === 1 ? "" : "s"} for "${searchInput.value.trim()}".`;
      } else if (activeCategory !== "all") {
        resultsCount.textContent =
          `Showing ${totalResults} result${totalResults === 1 ? "" : "s"} in this category.`;
      } else {
        resultsCount.textContent =
          `Showing all ${totalResults} pet guides and services.`;
      }
    }

    updateSearchURL(searchInput.value);
  }

  // Search as the user types.
  searchInput.addEventListener("input", renderResults);

  // Prevent the form from refreshing the page.
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderResults();
    searchInput.blur();
  });

  // Category filtering.
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "all";
      renderResults();
    });
  });

  // Sorting.
  sortSelect.addEventListener("change", renderResults);

  // Clear only the search keyword.
  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    renderResults();
    searchInput.focus();
  });

  // Suggested popular searches.
  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      searchInput.value = button.dataset.suggestion || "";
      renderResults();
    });
  });

  // Reset keyword, category and sorting.
  function resetAllFilters() {
    searchInput.value = "";
    activeCategory = "all";
    sortSelect.value = "relevance";

    renderResults();
    searchInput.focus();
  }

  resetButton.addEventListener("click", resetAllFilters);

  // Graceful handling if an external photograph fails to load.
  document.querySelectorAll(".search-card-image").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("image-failed");
        image.alt = "Pet photograph currently unavailable";
      },
      { once: true }
    );
  });

  // Initial page render, including ?q=dog from the URL.
  renderResults();
});