/**
 * PetSathi - Notifications Page Script
 * Handles notification listing, read/unread states, mark as read,
 * mark all as read, filtering, and empty-state handling.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "petsathi_notifications_data";

  // Sample platform notifications covering all required categories
  const SAMPLE_NOTIFICATIONS = [
    {
      id: 1,
      category: "care",
      categoryLabel: "Pet Care Update",
      icon: "🩺",
      title: "Vaccination Booster Due for Bruno",
      description: "Bruno's annual Rabies & DHPP booster vaccination is scheduled for next Tuesday, Nov 10. Remember to bring his health passport to the clinic.",
      timestamp: "Today, 10:30 AM",
      read: false
    },
    {
      id: 2,
      category: "walking",
      categoryLabel: "Pet Walking Update",
      icon: "🐕",
      title: "Morning Walk Completed with Bella",
      description: "Walker Priya completed a 45-minute stroll (2.4 km) around Green Meadows Park. Bella had plenty of water and was very energetic!",
      timestamp: "Today, 08:45 AM",
      read: false
    },
    {
      id: 3,
      category: "booking",
      categoryLabel: "Booking Update",
      icon: "📅",
      title: "Booking Confirmed: Weekend Pet Sitting",
      description: "Your reservation for Luna with caregiver Amit from Nov 14 to Nov 16 has been confirmed. Confirmation #PS-8921.",
      timestamp: "Yesterday, 04:15 PM",
      read: false
    },
    {
      id: 4,
      category: "announcement",
      categoryLabel: "General Announcement",
      icon: "📢",
      title: "New Feature: Live Route Walk Tracking",
      description: "You can now track your pet's walking route in real time with our newly launched GPS walk tracker and photo milestones feature.",
      timestamp: "Yesterday, 01:20 PM",
      read: true
    },
    {
      id: 5,
      category: "care",
      categoryLabel: "Pet Care Update",
      icon: "🥣",
      title: "Nutrition & Diet Transition Milestone",
      description: "Day 5 of Rocky's grain-free food transition completed. Increase ratio to 75% new mix starting with tonight's dinner bowl.",
      timestamp: "Oct 31, 2026, 06:30 PM",
      read: true
    },
    {
      id: 6,
      category: "walking",
      categoryLabel: "Pet Walking Update",
      icon: "🦮",
      title: "Upcoming Walk: Evening Stroll with Rahul",
      description: "Walker Rahul will arrive at 05:30 PM for Simba's evening park route. Please keep the leash and harness ready by the front door.",
      timestamp: "Oct 30, 2026, 03:00 PM",
      read: true
    },
    {
      id: 7,
      category: "booking",
      categoryLabel: "Booking Update",
      icon: "✨",
      title: "Booking Rescheduled: Grooming & Spa Slot",
      description: "Your pet grooming appointment for Milo at PawSpa has been successfully moved to Saturday, Nov 8 at 11:00 AM.",
      timestamp: "Oct 29, 2026, 02:15 PM",
      read: true
    },
    {
      id: 8,
      category: "announcement",
      categoryLabel: "General Announcement",
      icon: "❄️",
      title: "Winter Care Webinar for Pet Parents",
      description: "Join certified veterinary doctors this Saturday at 5 PM for our free live community session on winter paw safety, heating, and diet.",
      timestamp: "Oct 28, 2026, 11:00 AM",
      read: true
    }
  ];

  // Application State
  let notifications = [];
  let currentFilter = "all";

  // DOM Elements
  let notificationsListEl;
  let emptyStateEl;
  let markAllReadBtn;
  let clearAllBtn;
  let resetDemoBtn;
  let filterTabs;
  let statUnreadCountEl;
  let statTotalCountEl;
  let navUnreadDot;
  let toastEl;
  let toastMessageEl;
  let statusSummaryEl;

  /**
   * Load notifications from sessionStorage or fallback to default sample set
   */
  function loadNotifications() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          notifications = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn("sessionStorage not available, using in-memory sample state.", e);
    }
    // Deep clone defaults
    notifications = JSON.parse(JSON.stringify(SAMPLE_NOTIFICATIONS));
  }

  /**
   * Save notifications to sessionStorage
   */
  function saveNotifications() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Unable to save notifications to sessionStorage.", e);
    }
  }

  /**
   * Show a fleeting toast notification
   */
  let toastTimeout = null;
  function showToast(message, icon = "✓") {
    if (!toastEl) return;
    if (toastMessageEl) toastMessageEl.textContent = message;
    const iconEl = toastEl.querySelector(".toast-icon");
    if (iconEl) iconEl.textContent = icon;

    toastEl.classList.add("show");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2800);
  }

  /**
   * Update header, hero stats, and filter counts
   */
  function updateCounters() {
    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.read).length;

    // Hero stat pills
    if (statUnreadCountEl) statUnreadCountEl.textContent = unreadCount;
    if (statTotalCountEl) statTotalCountEl.textContent = totalCount;

    // Navigation dot
    if (navUnreadDot) {
      if (unreadCount > 0) {
        navUnreadDot.classList.remove("hidden");
        navUnreadDot.setAttribute("title", `${unreadCount} unread notifications`);
      } else {
        navUnreadDot.classList.add("hidden");
        navUnreadDot.removeAttribute("title");
      }
    }

    // Filter tab counts
    const countAllEl = document.getElementById("countAll");
    const countUnreadEl = document.getElementById("countUnread");
    const countCareEl = document.getElementById("countCare");
    const countWalkingEl = document.getElementById("countWalking");
    const countBookingEl = document.getElementById("countBooking");
    const countAnnouncementEl = document.getElementById("countAnnouncement");

    if (countAllEl) countAllEl.textContent = totalCount;
    if (countUnreadEl) countUnreadEl.textContent = unreadCount;
    if (countCareEl) countCareEl.textContent = notifications.filter(n => n.category === "care").length;
    if (countWalkingEl) countWalkingEl.textContent = notifications.filter(n => n.category === "walking").length;
    if (countBookingEl) countBookingEl.textContent = notifications.filter(n => n.category === "booking").length;
    if (countAnnouncementEl) countAnnouncementEl.textContent = notifications.filter(n => n.category === "announcement").length;

    // Mark All as Read button state
    if (markAllReadBtn) {
      if (unreadCount === 0 || totalCount === 0) {
        markAllReadBtn.disabled = true;
        markAllReadBtn.innerHTML = `<span>✓</span> All Caught Up`;
      } else {
        markAllReadBtn.disabled = false;
        markAllReadBtn.innerHTML = `<span>✓✓</span> Mark All as Read`;
      }
    }

    // Clear all & Reset demo button visibility
    if (clearAllBtn && resetDemoBtn) {
      if (totalCount === 0) {
        clearAllBtn.style.display = "none";
        resetDemoBtn.style.display = "inline-flex";
      } else {
        clearAllBtn.style.display = "inline-flex";
        resetDemoBtn.style.display = "none";
      }
    }
  }

  /**
   * Filter notifications based on active selection
   */
  function getFilteredNotifications() {
    switch (currentFilter) {
      case "unread":
        return notifications.filter(n => !n.read);
      case "care":
        return notifications.filter(n => n.category === "care");
      case "walking":
        return notifications.filter(n => n.category === "walking");
      case "booking":
        return notifications.filter(n => n.category === "booking");
      case "announcement":
        return notifications.filter(n => n.category === "announcement");
      case "all":
      default:
        return notifications;
    }
  }

  /**
   * Render notifications list or empty state
   */
  function render() {
    updateCounters();

    const filtered = getFilteredNotifications();

    // Update status summary text
    if (statusSummaryEl) {
      const filterLabels = {
        all: "All Notifications",
        unread: "Unread Updates",
        care: "Pet Care Updates",
        walking: "Pet Walking Updates",
        booking: "Booking Updates",
        announcement: "General Announcements"
      };
      const label = filterLabels[currentFilter] || "Notifications";
      statusSummaryEl.innerHTML = `Showing <span class="active-filter-label">${filtered.length} ${label}</span>`;
    }

    // Empty State check
    if (filtered.length === 0) {
      notificationsListEl.style.display = "none";
      emptyStateEl.style.display = "block";

      const emptyTitle = document.getElementById("emptyStateTitle");
      const emptyDesc = document.getElementById("emptyStateDesc");
      const emptyActionBtn = document.getElementById("emptyStateActionBtn");

      if (notifications.length === 0) {
        // Completely empty
        if (emptyTitle) emptyTitle.textContent = "No notifications yet";
        if (emptyDesc) emptyDesc.textContent = "You have cleared all platform notifications. Restore sample alerts below to explore the notification center.";
        if (emptyActionBtn) {
          emptyActionBtn.textContent = "↻ Restore Sample Notifications";
          emptyActionBtn.onclick = resetSampleNotifications;
        }
      } else if (currentFilter === "unread") {
        // No unread
        if (emptyTitle) emptyTitle.textContent = "You're all caught up! 🐾";
        if (emptyDesc) emptyDesc.textContent = "No unread notifications at the moment. Great job keeping up with your pet's schedule.";
        if (emptyActionBtn) {
          emptyActionBtn.textContent = "View All Notifications";
          emptyActionBtn.onclick = () => setFilter("all");
        }
      } else {
        // Empty category
        if (emptyTitle) emptyTitle.textContent = "No notifications in this category";
        if (emptyDesc) emptyDesc.textContent = "There are no notifications matching this category right now.";
        if (emptyActionBtn) {
          emptyActionBtn.textContent = "View All Notifications";
          emptyActionBtn.onclick = () => setFilter("all");
        }
      }
      return;
    }

    // Display List
    emptyStateEl.style.display = "none";
    notificationsListEl.style.display = "flex";
    notificationsListEl.innerHTML = "";

    filtered.forEach(notif => {
      const card = document.createElement("article");
      card.className = `notif-card ${notif.read ? "read" : "unread"}`;
      card.dataset.id = notif.id;
      card.dataset.cat = notif.category;

      card.innerHTML = `
        <div class="notif-icon-col" aria-hidden="true">${notif.icon}</div>
        <div class="notif-content-col">
          <div class="notif-meta-row">
            <span class="cat-badge cat-badge-${notif.category}">${notif.categoryLabel}</span>
            <span class="notif-time">
              <span class="notif-time-icon" aria-hidden="true">🕒</span>
              <time>${notif.timestamp}</time>
            </span>
            <span class="notif-unread-indicator">
              <span class="notif-pulse-dot" aria-hidden="true"></span>
              New
            </span>
            <span class="notif-read-indicator">
              ✓ Read
            </span>
          </div>
          <h2 class="notif-title">${notif.title}</h2>
          <p class="notif-description">${notif.description}</p>
          <div class="notif-card-actions">
            ${
              !notif.read
                ? `<button class="btn-card-action btn-card-read" data-action="mark-read" data-id="${notif.id}">
                     <span aria-hidden="true">✓</span> Mark as Read
                   </button>`
                : `<button class="btn-card-action btn-card-unread" data-action="mark-unread" data-id="${notif.id}">
                     <span aria-hidden="true">↺</span> Mark as Unread
                   </button>`
            }
            <button class="btn-card-action btn-card-delete" data-action="delete" data-id="${notif.id}" title="Dismiss notification">
              <span aria-hidden="true">✕</span> Dismiss
            </button>
          </div>
        </div>
      `;

      notificationsListEl.appendChild(card);
    });
  }

  /**
   * Mark single notification as read
   */
  function markAsRead(id) {
    const item = notifications.find(n => n.id === id);
    if (!item || item.read) return;

    item.read = true;
    saveNotifications();
    render();
    showToast(`Marked "${item.title}" as read`);
  }

  /**
   * Mark single notification as unread
   */
  function markAsUnread(id) {
    const item = notifications.find(n => n.id === id);
    if (!item || !item.read) return;

    item.read = false;
    saveNotifications();
    render();
    showToast(`Marked "${item.title}" as unread`);
  }

  /**
   * Mark all notifications as read
   */
  function markAllAsRead() {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) return;

    notifications.forEach(n => {
      n.read = true;
    });

    saveNotifications();
    render();
    showToast(`All ${unreadCount} notifications marked as read!`, "✓✓");
  }

  /**
   * Delete single notification
   */
  function deleteNotification(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return;

    const removed = notifications.splice(index, 1)[0];
    saveNotifications();
    render();
    showToast(`Dismissed "${removed.title}"`, "✕");
  }

  /**
   * Clear all notifications (shows empty state)
   */
  function clearAllNotifications() {
    if (notifications.length === 0) return;
    const count = notifications.length;
    notifications = [];
    saveNotifications();
    render();
    showToast(`Cleared ${count} notifications`, "🗑");
  }

  /**
   * Restore default sample notifications
   */
  function resetSampleNotifications() {
    notifications = JSON.parse(JSON.stringify(SAMPLE_NOTIFICATIONS));
    currentFilter = "all";
    updateActiveFilterTab("all");
    saveNotifications();
    render();
    showToast("Restored sample notifications", "↻");
  }

  /**
   * Set active filter category
   */
  function setFilter(filter) {
    currentFilter = filter;
    updateActiveFilterTab(filter);
    render();
  }

  function updateActiveFilterTab(filter) {
    if (!filterTabs) return;
    filterTabs.forEach(tab => {
      if (tab.dataset.filter === filter) {
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      }
    });
  }

  /**
   * Bind event listeners
   */
  function initEvents() {
    // Filter tabs click
    if (filterTabs) {
      filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
          setFilter(tab.dataset.filter);
        });
      });
    }

    // Mark all as read button
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", markAllAsRead);
    }

    // Clear all button
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", clearAllNotifications);
    }

    // Reset demo button
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener("click", resetSampleNotifications);
    }

    // Delegation on notification list for card action buttons
    if (notificationsListEl) {
      notificationsListEl.addEventListener("click", e => {
        const button = e.target.closest("button[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const id = parseInt(button.dataset.id, 10);

        if (action === "mark-read") {
          markAsRead(id);
        } else if (action === "mark-unread") {
          markAsUnread(id);
        } else if (action === "delete") {
          deleteNotification(id);
        }
      });
    }
  }

  /**
   * Initialization on DOM ready
   */
  document.addEventListener("DOMContentLoaded", () => {
    // Cache DOM Elements
    notificationsListEl = document.getElementById("notificationsList");
    emptyStateEl = document.getElementById("emptyState");
    markAllReadBtn = document.getElementById("markAllReadBtn");
    clearAllBtn = document.getElementById("clearAllBtn");
    resetDemoBtn = document.getElementById("resetDemoBtn");
    filterTabs = document.querySelectorAll(".filter-tab");
    statUnreadCountEl = document.getElementById("statUnreadCount");
    statTotalCountEl = document.getElementById("statTotalCount");
    navUnreadDot = document.getElementById("navUnreadDot");
    toastEl = document.getElementById("notifToast");
    toastMessageEl = document.getElementById("toastMessage");
    statusSummaryEl = document.getElementById("statusSummary");

    loadNotifications();
    initEvents();
    render();
  });
})();
