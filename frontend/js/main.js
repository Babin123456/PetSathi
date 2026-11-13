document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    // 1. Mobile menu toggle button
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

      // Reset any open sub-accordions when closing the drawer
      if (!open) {
        nav.querySelectorAll(".nav-item.is-open").forEach((item) => {
          item.classList.remove("is-open");
          const parentLink = item.querySelector(":scope > a");
          if (parentLink) {
            parentLink.setAttribute("aria-expanded", "false");
          }
        });
      }
    });

    // 2. Mobile accordion toggle for dropdown parents
    const navItemsWithDropdown = nav.querySelectorAll(".nav-item");
    navItemsWithDropdown.forEach((item) => {
      const parentLink = item.querySelector(":scope > a");
      const dropdown = item.querySelector(".dropdown");

      if (parentLink && dropdown) {
        parentLink.setAttribute("aria-haspopup", "true");
        parentLink.setAttribute("aria-expanded", "false");

        parentLink.addEventListener("click", (e) => {
          // On mobile viewports (<= 850px), toggle accordion instead of navigating
          if (window.innerWidth <= 850) {
            e.preventDefault();
            const isOpen = item.classList.toggle("is-open");
            parentLink.setAttribute("aria-expanded", String(isOpen));

            // Close other open accordions for a clean single-open accordion experience
            navItemsWithDropdown.forEach((otherItem) => {
              if (otherItem !== item && otherItem.classList.contains("is-open")) {
                otherItem.classList.remove("is-open");
                const otherLink = otherItem.querySelector(":scope > a");
                if (otherLink) {
                  otherLink.setAttribute("aria-expanded", "false");
                }
              }
            });
          }
        });
      }
    });

    // 3. Close drawer ONLY on leaf navigation link clicks (not dropdown parents)
    nav.querySelectorAll("a").forEach((link) => {
      // Do not close when tapping a dropdown toggle link
      if (
        link.closest(".nav-item") &&
        link.parentElement.classList.contains("nav-item") &&
        link.nextElementSibling?.classList.contains("dropdown")
      ) {
        return;
      }

      link.addEventListener("click", () => {
        if (window.innerWidth <= 850) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

          // Reset accordion states
          nav.querySelectorAll(".nav-item.is-open").forEach((item) => {
            item.classList.remove("is-open");
            const parentLink = item.querySelector(":scope > a");
            if (parentLink) {
              parentLink.setAttribute("aria-expanded", "false");
            }
          });
        }
      });
    });

    // 4. Handle resize from mobile to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        nav.querySelectorAll(".nav-item.is-open").forEach((item) => {
          item.classList.remove("is-open");
          const parentLink = item.querySelector(":scope > a");
          if (parentLink) {
            parentLink.setAttribute("aria-expanded", "false");
          }
        });
      }
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
