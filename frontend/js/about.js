/**
 * PetSathi - About Us Page JavaScript (about.js)
 * Vanilla JavaScript for interactive tabs, FAQ accordion, counter animations,
 * and image error handling.
 */

document.addEventListener("DOMContentLoaded", () => {
  initRoleTabs();
  initFaqAccordion();
  initStatsCounter();
  initImageFallbacks();
  initSmoothScroll();
});

/**
 * Interactive Tab Switcher for "How PetSathi Helps"
 */
function initRoleTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  if (!tabButtons.length || !tabPanels.length) return;

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetRole = button.getAttribute("data-tab");

      // Deactivate all buttons
      tabButtons.forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

      // Hide all panels
      tabPanels.forEach(panel => {
        panel.classList.remove("active");
      });

      // Activate current button and matching panel
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      const activePanel = document.getElementById(`panel-${targetRole}`);
      if (activePanel) {
        activePanel.classList.add("active");
      }
    });

    // Keyboard navigation (ArrowLeft / ArrowRight)
    button.addEventListener("keydown", (e) => {
      let targetBtn = null;
      const btnList = Array.from(tabButtons);
      const currentIndex = btnList.indexOf(button);

      if (e.key === "ArrowRight") {
        targetBtn = btnList[(currentIndex + 1) % btnList.length];
      } else if (e.key === "ArrowLeft") {
        targetBtn = btnList[(currentIndex - 1 + btnList.length) % btnList.length];
      }

      if (targetBtn) {
        targetBtn.focus();
        targetBtn.click();
      }
    });
  });
}

/**
 * FAQ Accordion with smooth expanding/collapsing
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isCurrentlyActive = item.classList.contains("active");

      // Close all other FAQ items for a clean accordion effect
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherBtn = otherItem.querySelector(".faq-question");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current item
      if (isCurrentlyActive) {
        item.classList.remove("active");
        questionBtn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/**
 * Animated Stat Numbers using IntersectionObserver
 */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");

  if (!statNumbers.length) return;

  const countUp = (element) => {
    const target = parseInt(element.getAttribute("data-target"), 10);
    const duration = 1500; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * target);

      element.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });

  statNumbers.forEach(num => observer.observe(num));
}

/**
 * Fallback handler for all images on the page
 * Generates an elegant SVG placeholder if any external image fails to load
 */
function initImageFallbacks() {
  const images = document.querySelectorAll("img");

  const createSvgFallback = (altText) => {
    const safeText = (altText || "PetSathi").replace(/[<>&"]/g, "");
    return `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20style%3D%22background%3A%23eaf0e6%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2246%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-size%3D%2244%22%3E🐾%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2262%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-weight%3D%22bold%22%20fill%3D%22%23286849%22%20font-size%3D%2218%22%3E${encodeURIComponent(safeText)}%3C%2Ftext%3E%3C%2Fsvg%3E`;
  };

  images.forEach(img => {
    // If the image already failed to load before script ran
    if (img.complete && img.naturalWidth === 0) {
      img.src = createSvgFallback(img.alt);
    }

    img.addEventListener("error", function () {
      this.onerror = null; // Prevent loop
      this.src = createSvgFallback(this.alt);
    });
  });
}

/**
 * Smooth scrolling for in-page anchors
 */
function initSmoothScroll() {
  const inPageLinks = document.querySelectorAll('a[href^="#"]');

  inPageLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || !targetId) return;

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });
}

