/**
 * PetSathi - Aquarium Fish Interactive Script
 * Provides search/filter, compatibility checker, tank volume calculator,
 * water parameter tabs, FAQ accordion, and robust image fallback.
 */

document.addEventListener("DOMContentLoaded", () => {
  initSearchAndFilter();
  initCompatibilityChecker();
  initTankCalculator();
  initFaqAccordion();
  initWaterTabs();
  initImageFallbacks();
});

/* ========================================================
   1. SPECIES SEARCH & CATEGORY FILTER
   ======================================================== */
function initSearchAndFilter() {
  const searchInput = document.getElementById("fish-search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  const filterButtons = document.querySelectorAll(".filter-pill-btn");
  const fishCards = document.querySelectorAll(".fish-card");
  const countBadge = document.getElementById("visible-species-count");
  const noResultsMsg = document.getElementById("no-results-message");

  let activeCategory = "all";
  let activeSearchTerm = "";

  function applyFilters() {
    let visibleCount = 0;

    fishCards.forEach((card) => {
      const name = (card.dataset.name || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const water = (card.dataset.water || "").toLowerCase();
      const description = (card.querySelector(".fish-card-desc")?.textContent || "").toLowerCase();
      const cardCategories = (card.dataset.category || "").toLowerCase().split(" ");

      const matchesSearch =
        !activeSearchTerm ||
        name.includes(activeSearchTerm) ||
        tags.includes(activeSearchTerm) ||
        water.includes(activeSearchTerm) ||
        description.includes(activeSearchTerm);

      const matchesCategory =
        activeCategory === "all" || cardCategories.includes(activeCategory);

      if (matchesSearch && matchesCategory) {
        card.style.display = "";
        card.classList.remove("card-hidden");
        visibleCount++;
      } else {
        card.style.display = "none";
        card.classList.add("card-hidden");
      }
    });

    if (countBadge) {
      countBadge.textContent = visibleCount;
    }

    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
    }

    if (clearBtn) {
      clearBtn.style.display = activeSearchTerm.length > 0 ? "inline-flex" : "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      activeSearchTerm = "";
      applyFilters();
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.filter || "all";
      applyFilters();
    });
  });
}

/* ========================================================
   2. INTERACTIVE TANK COMPATIBILITY CHECKER
   ======================================================== */
const COMPATIBILITY_DATABASE = {
  // Key format: 'fishA_fishB' (alphabetically sorted)
  angelfish_angelfish: {
    status: "caution",
    title: "Territorial Hierarchy / Conditional",
    text: "Angelfish can be kept together in mated pairs or in groups of 5+ in large aquariums (55+ gallons). However, unbonded adults or competing males will fight for dominance and territory, especially when breeding."
  },
  angelfish_betta: {
    status: "incompatible",
    title: "Incompatible — High Aggression & Fin Damage",
    text: "Both Angelfish and Betta fish are territorial centerpiece species with long, flowing fins. Angelfish will nip betta fins, and bettas may attempt to fight, causing severe stress and injury."
  },
  angelfish_goldfish: {
    status: "incompatible",
    title: "Incompatible — Environmental & Temperature Mismatch",
    text: "Goldfish are coldwater grazers (18–22°C) needing high oxygen and heavy filtration. Angelfish are tropical Amazonian cichlids (25–29°C) requiring warm, soft, mildly acidic water. Their environmental needs cannot be reconciled."
  },
  angelfish_guppy: {
    status: "caution",
    title: "Caution — Predation Risk on Small Fish",
    text: "Adult Angelfish are natural predators with large mouths. While they may coexist with robust female guppies, small males and fry will routinely be hunted and eaten. Angelfish can also nip fancy guppy tails."
  },
  angelfish_molly: {
    status: "compatible",
    title: "Compatible in Large Aquariums (30+ gal)",
    text: "Mollies are large enough to avoid being viewed as prey by Angelfish. Both enjoy plant-rich tanks, though mollies prefer slightly harder water than angelfish. Maintain a neutral pH (~7.2)."
  },
  angelfish_neon_tetra: {
    status: "incompatible",
    title: "Incompatible — Natural Predator & Prey",
    text: "In the wild, Neon Tetras are natural prey for Angelfish. Once Angelfish reach maturity, they will hunt and swallow small Neon Tetras during twilight or overnight. Choose larger tetras (e.g. Bleeding Heart) instead."
  },
  angelfish_platy: {
    status: "compatible",
    title: "Compatible in 30+ Gallon Tanks",
    text: "Adult Platies are stocky enough not to be harassed or eaten by Angelfish. Platies keep to the lower/middle levels while Angelfish patrol open waters. Any platy fry will be consumed as live food."
  },
  angelfish_zebra_danio: {
    status: "caution",
    title: "Caution — Danio Hyperactivity May Annoy Angels",
    text: "Zebra Danios are ultra-fast dither fish that won't be easily caught by Angelfish. However, their frantic darting can stress the stately, slower-moving Angelfish, and danios may occasionally nip long trailing pelvic filaments."
  },

  betta_betta: {
    status: "incompatible",
    title: "Strictly Incompatible — Fatal Aggression",
    text: "Two male Betta splendens must NEVER be housed in the same tank. They will fight aggressively until severe injury or death occurs. Female sororities require specialized high-experience setups of 20+ gallons with 5+ females."
  },
  betta_goldfish: {
    status: "incompatible",
    title: "Strictly Incompatible — Coldwater vs Tropical",
    text: "Bettas require warm tropical waters (25–28°C) with calm filtration. Goldfish require cold water (18–22°C) and produce high volumes of waste that foul betta water rapidly. Never combine them."
  },
  betta_guppy: {
    status: "caution",
    title: "Caution — Long Fins Can Trigger Attacks",
    text: "Male Bettas frequently mistake fancy male guppies' colorful, flowing tails for rival bettas, prompting aggressive flare-ups and attacks. Alternatively, fast guppies may nip betta fins. Female guppies or large planted tanks may sometimes work with gentle bettas."
  },
  betta_molly: {
    status: "caution",
    title: "Caution — Activity Level & Tank Size",
    text: "Mollies are high-energy, boisterous fish that can overwhelm a placid Betta. They also prefer harder, alkaline water with moderate flow, whereas bettas prefer gentle currents and soft-to-neutral water."
  },
  betta_neon_tetra: {
    status: "compatible",
    title: "Compatible in 10+ Gallon Planted Tanks",
    text: "Neon Tetras occupy the mid-water while Bettas inhabit the surface. Provided the tank has ample plants and the school has 6+ tetras (which discourages fin-nipping), they make colorful, peaceful tank mates."
  },
  betta_platy: {
    status: "compatible",
    title: "Compatible Community Pair",
    text: "Platies are calm, lack long flowing fins, and rarely bother Bettas. In a well-planted 10–15 gallon tank with resting spots near the surface, they make peaceful, colorful companions."
  },
  betta_zebra_danio: {
    status: "caution",
    title: "Caution — Fast Danios Can Stress Bettas",
    text: "Zebra Danios are frenetic, non-stop surface swimmers that can outcompete slow-feeding Bettas for food and may nip their delicate fins. Bettas prefer calm, tranquil swimming companions."
  },

  goldfish_goldfish: {
    status: "compatible",
    title: "Highly Compatible (Same Body Types)",
    text: "Goldfish are social fish that thrive in groups! Pair fancy varieties (Oranda, Fantail, Black Moor) together, and keep fast single-tailed varieties (Comets, Shubunkins) together so slow swimmers don't get outcompeted for food."
  },
  goldfish_guppy: {
    status: "incompatible",
    title: "Incompatible — Temperature & Predation",
    text: "Goldfish are coldwater fish with hearty appetites; as they grow, they will readily swallow small guppies. Additionally, guppies need tropical temperatures (24–28°C)."
  },
  goldfish_molly: {
    status: "incompatible",
    title: "Incompatible — Temperature & Water Quality",
    text: "Mollies require tropical warmth (24–28°C) and clean, low-waste water. Goldfish produce enormous amounts of ammonia and thrive in cold water (18–22°C)."
  },
  goldfish_neon_tetra: {
    status: "incompatible",
    title: "Incompatible — Tetras Become Live Food",
    text: "Neon Tetras are tiny tropical fish that will quickly become an expensive snack for goldfish. Goldfish forage incessantly and eat anything that fits into their mouths."
  },
  goldfish_platy: {
    status: "incompatible",
    title: "Incompatible — Temperature Mismatch",
    text: "Goldfish require unheated coldwater aquariums, whereas Platies require tropical heating (22–27°C). Goldfish bioload can also overwhelm community-sized platy tanks."
  },
  goldfish_zebra_danio: {
    status: "caution",
    title: "Caution — Temperature Overlap but Predation Risk",
    text: "Both can tolerate cool water (18–22°C). However, when goldfish mature and reach 15–25 cm, small zebra danios are at high risk of being swallowed during night rest."
  },

  guppy_guppy: {
    status: "compatible",
    title: "Highly Compatible — Social Livebearers",
    text: "Guppies love living together! Maintain a ratio of 1 male to 2–3 females to prevent males from harassing females, or keep an all-male group to prevent endless fry population explosions."
  },
  guppy_molly: {
    status: "compatible",
    title: "Highly Compatible — Shared Water Chemistry",
    text: "Both are livebearers that thrive in hard, slightly alkaline tropical water (pH 7.2–8.2). They are active, peaceful, and share similar omnivorous dietary requirements."
  },
  guppy_neon_tetra: {
    status: "compatible",
    title: "Compatible Community Favorites",
    text: "A classic beginner combination! Guppies stay near the top, while Neon Tetras cruise the mid-water. Maintain neutral water (pH 7.0–7.4) and a stable 24–25°C."
  },
  guppy_platy: {
    status: "compatible",
    title: "Highly Compatible — Perfect Community Mates",
    text: "Guppies and Platies are both hardy, colorful, peaceful livebearers with identical water parameters and feeding habits. One of the friendliest combinations in the hobby!"
  },
  guppy_zebra_danio: {
    status: "compatible",
    title: "Compatible Active Community",
    text: "Both species are vigorous, hardy, and peaceful. Ensure the tank is at least 15 gallons so Danios have open swimming room without crowding the guppies."
  },

  molly_molly: {
    status: "compatible",
    title: "Highly Compatible — Schooling Livebearer",
    text: "Mollies are very social and thrive in groups of 4+. Keep a ratio of 1 male to 2+ females. They will actively graze on aquarium algae together."
  },
  molly_neon_tetra: {
    status: "compatible",
    title: "Compatible with Balanced Water Chemistry",
    text: "Both are peaceful community members. Mollies prefer harder water (pH 7.5–8.2) while Neons prefer soft water (pH 6.5–7.0). They adapt well at a neutral pH of 7.0–7.4 and 25°C."
  },
  molly_platy: {
    status: "compatible",
    title: "Highly Compatible — Ideal Livebearer Companions",
    text: "Outstanding compatibility! Both relish clean, mineral-rich alkaline water, nibble on soft green algae, and create a peaceful, lively, colorful display."
  },
  molly_zebra_danio: {
    status: "compatible",
    title: "Compatible Active Tankmates",
    text: "Both are active, sturdy fish that enjoy gentle currents and plenty of swimming room. Perfect for a 20+ gallon community tank."
  },

  neon_tetra_neon_tetra: {
    status: "compatible",
    title: "Essential — Mandatory Schooling Species",
    text: "Neon Tetras MUST be kept in groups of at least 6 to 10 individuals. In proper schools, they exhibit tight synchronized swimming, feel secure, and display their richest neon colors."
  },
  neon_tetra_platy: {
    status: "compatible",
    title: "Highly Compatible Community Pair",
    text: "Platies are calm and gentle, posing zero threat to delicate Neon Tetras. A planted tank with open middle swimming space suits both species wonderfully."
  },
  neon_tetra_zebra_danio: {
    status: "compatible",
    title: "Compatible Multi-Level Schoolers",
    text: "Danios dart across the upper surface layers while Neon Tetras glide calmly through the middle. A classic, hardy planted community combination."
  },

  platy_platy: {
    status: "compatible",
    title: "Highly Compatible — Playful Group Swimmers",
    text: "Platies are among the most peaceful fish in the world. They thrive in small groups with 2 females per male and will explore every nook of the aquarium."
  },
  platy_zebra_danio: {
    status: "compatible",
    title: "Highly Compatible — Hardy & Entertaining",
    text: "Both species are exceptionally hardy, forgiving for beginners, and active. They share similar temperature ranges and feed enthusiastically on quality flakes and pellets."
  },

  zebra_danio_zebra_danio: {
    status: "compatible",
    title: "Essential — High-Energy Schooling Fish",
    text: "Zebra Danios must be kept in schools of 6 or more. In groups, their fast chasing behavior is directed playfully at one another rather than other fish species."
  }
};

function initCompatibilityChecker() {
  const fishSelect1 = document.getElementById("compat-fish-1");
  const fishSelect2 = document.getElementById("compat-fish-2");
  const checkBtn = document.getElementById("check-compat-btn");
  const resultCard = document.getElementById("compat-result-card");
  const statusPill = document.getElementById("compat-status-pill");
  const resultTitle = document.getElementById("compat-result-title");
  const resultDesc = document.getElementById("compat-result-desc");

  function evaluateCompatibility() {
    if (!fishSelect1 || !fishSelect2 || !resultCard) return;

    const val1 = fishSelect1.value;
    const val2 = fishSelect2.value;

    if (!val1 || !val2) {
      resultCard.style.display = "block";
      resultCard.className = "compat-result-card status-caution";
      statusPill.textContent = "Please Select";
      resultTitle.textContent = "Select Two Fish Species";
      resultDesc.textContent = "Choose two fish from the dropdown menus above to check their tank compatibility, water requirements, and temperament.";
      return;
    }

    const sortedKey = [val1, val2].sort().join("_");
    const record = COMPATIBILITY_DATABASE[sortedKey] || {
      status: "caution",
      title: "Unknown Combination / Monitor Closely",
      text: "Always research adult size, feeding habits, and water chemistry parameters before mixing fish."
    };

    resultCard.style.display = "block";
    resultCard.className = `compat-result-card status-${record.status}`;

    if (record.status === "compatible") {
      statusPill.textContent = "🟢 Compatible";
      statusPill.className = "status-badge badge-compatible";
    } else if (record.status === "caution") {
      statusPill.textContent = "🟡 Caution / Conditional";
      statusPill.className = "status-badge badge-caution";
    } else {
      statusPill.textContent = "🔴 Incompatible";
      statusPill.className = "status-badge badge-incompatible";
    }

    resultTitle.textContent = record.title;
    resultDesc.textContent = record.text;

    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (checkBtn) {
    checkBtn.addEventListener("click", evaluateCompatibility);
  }

  if (fishSelect1 && fishSelect2) {
    fishSelect1.addEventListener("change", evaluateCompatibility);
    fishSelect2.addEventListener("change", evaluateCompatibility);
  }
}

/* ========================================================
   3. AQUARIUM VOLUME & EQUIPMENT CALCULATOR
   ======================================================== */
function initTankCalculator() {
  const lengthInput = document.getElementById("calc-length");
  const widthInput = document.getElementById("calc-width");
  const heightInput = document.getElementById("calc-height");
  const unitSelect = document.getElementById("calc-unit");
  const calculateBtn = document.getElementById("calc-submit-btn");

  const litersOut = document.getElementById("calc-result-liters");
  const gallonsOut = document.getElementById("calc-result-gallons");
  const filterOut = document.getElementById("calc-result-filter");
  const heaterOut = document.getElementById("calc-result-heater");
  const calcOutputBox = document.getElementById("calc-output-box");

  function calculateVolume() {
    const l = parseFloat(lengthInput?.value);
    const w = parseFloat(widthInput?.value);
    const h = parseFloat(heightInput?.value);
    const unit = unitSelect?.value || "cm";

    if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) {
      alert("Please enter positive dimensions for length, width, and height.");
      return;
    }

    let volumeLiters = 0;
    let volumeGallons = 0;

    if (unit === "cm") {
      // Volume in Liters = (L * W * H) / 1000
      volumeLiters = (l * w * h) / 1000;
      volumeGallons = volumeLiters * 0.264172;
    } else {
      // Dimensions in inches: Volume in US Gallons = (L * W * H) / 231
      volumeGallons = (l * w * h) / 231;
      volumeLiters = volumeGallons * 3.78541;
    }

    // Recommended filter flow = 4 to 5 times tank volume per hour
    const filterLph = Math.round(volumeLiters * 4.5);
    const filterGph = Math.round(volumeGallons * 4.5);

    // Recommended heater wattage = 3 to 5 Watts per gallon (or ~1 Watt per Liter)
    const heaterWatts = Math.max(25, Math.round(volumeGallons * 4 / 25) * 25);

    if (litersOut) litersOut.textContent = `${volumeLiters.toFixed(1)} L`;
    if (gallonsOut) gallonsOut.textContent = `${volumeGallons.toFixed(1)} Gal`;
    if (filterOut) filterOut.textContent = `${filterLph} L/h (${filterGph} GPH)`;
    if (heaterOut) heaterOut.textContent = `${heaterWatts} Watts`;

    if (calcOutputBox) {
      calcOutputBox.style.display = "block";
      calcOutputBox.classList.add("fade-in");
    }
  }

  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateVolume);
  }
}

/* ========================================================
   4. WATER PARAMETER TABS
   ======================================================== */
function initWaterTabs() {
  const tabs = document.querySelectorAll(".water-tab-btn");
  const panes = document.querySelectorAll(".water-tab-pane");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;
      tabs.forEach((t) => t.classList.remove("active"));
      panes.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });
}

/* ========================================================
   5. FAQ ACCORDION
   ======================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all other items for a clean accordion effect
      faqItems.forEach((other) => {
        other.classList.remove("open");
        const otherBtn = other.querySelector(".faq-question");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ========================================================
   6. IMAGE FALLBACK HANDLER (GUARANTEES NO BROKEN IMAGES)
   ======================================================== */
function initImageFallbacks() {
  const images = document.querySelectorAll(".fish-image, .setup-card-img, .pet-card-image");

  images.forEach((img) => {
    img.addEventListener("error", () => {
      const parent = img.parentElement;
      if (parent) {
        parent.classList.add("has-fallback-pattern");
      }
      // Create SVG placeholder with fish illustration and name
      const altText = img.getAttribute("alt") || "Aquarium Fish";
      const svgPlaceholder = `data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23286849%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231d5039%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22180%22%20r%3D%2270%22%20fill%3D%22rgba(255%2C255%2C255%2C0.12)%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22195%22%20font-size%3D%2258%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%3E%F0%9F%90%A0%3C%2Ftext%3E%3Ctext%20x%3D%22300%22%20y%3D%22265%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22bold%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%3E${encodeURIComponent(
        altText
      )}%3C%2Ftext%3E%3Ctext%20x%3D%22300%22%20y%3D%22295%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2213%22%20text-anchor%3D%22middle%22%20fill%3D%22%23cce0d4%22%3EPetSathi%20Aquatic%20Guide%3C%2Ftext%3E%3C%2Fsvg%3E`;
      img.src = svgPlaceholder;
    });
  });
}

