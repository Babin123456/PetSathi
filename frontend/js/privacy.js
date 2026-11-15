/**
 * ============================================================================
 * PetSathi - Privacy Policy Interactive Logic (frontend/js/privacy.js)
 * Handles Table of Contents active-link tracking via IntersectionObserver,
 * smooth scrolling with proper offset, and back-to-top button.
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".privacy-section");
  const navLinks = document.querySelectorAll(".privacy-toc-link");
  const backToTopBtn = document.getElementById("backToTopBtn");

  // 1. Intersection Observer for Table of Contents active highlight
  if (sections.length > 0 && navLinks.length > 0 && "IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "-95px 0px -65% 0px",
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  // 2. Back to top button visibility toggle
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("is-visible");
      } else {
        backToTopBtn.classList.remove("is-visible");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
