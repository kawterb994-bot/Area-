
/* =====================================
   LUNORA — FIXED MAIN JAVASCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  const sidebar = $("#sidebar");
  const menuBtn = $("#menuBtn");
  const themeBtn = $("#themeBtn");
  const pageTitle = $("#pageTitle");

  // PAGE TITLES
  const titles = {
    dashboard: "Good day, Sunshine ✨",
    tasks: "My Tasks ✓",
    habits: "My Habits ◷",
    calendar: "My Calendar ▦",
    journal: "My Journal ✎",
    goals: "My Goals ◇",
    study: "Study Planner ▤",
    finance: "My Finance $",
    health: "Glow Up ♡",
    statistics: "Your Statistics ▥",
    settings: "Settings ⚙"
  };

  // STORAGE
  const storage = {
    save(key, value) {
      try {
        localStorage.setItem(
          "lunora-" + key,
          JSON.stringify(value)
        );
        return true;
      } catch (error) {
        console.error("LUNORA storage error:", error);
        return false;
      }
    },

    get(key, fallback = []) {
      try {
        const value = localStorage.getItem("lunora-" + key);
        return value === null ? fallback : JSON.parse(value);
      } catch (error) {
        console.error("LUNORA read error:", error);
        return fallback;
      }
    }
  };

  // SAFE HTML
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  // NAVIGATION
  function showPage(pageId, updateURL = true) {
    const target = document.getElementById(pageId);

    if (!target || !target.classList.contains("page")) {
      pageId = "dashboard";
    }

    $$(".page").forEach(page => {
      page.classList.toggle("active", page.id === pageId);
    });

    $$(".nav-link[data-page]").forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.page === pageId
      );
    });

    if (pageTitle) {
      pageTitle.textContent = titles[pageId] || "LUNORA";
    }

    if (updateURL && location.hash !== "#" + pageId) {
      history.pushState(null, "", "#" + pageId);
    }

    closeMenu();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // NAVIGATION BUTTONS
  $$(".nav-link[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // QUICK NAVIGATION
  $$("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.go);
    });
  });

  // BROWSER BACK / FORWARD
  window.addEventListener("popstate", () => {
    const page = location.hash.slice(1) || "dashboard";
    showPage(page, false);
  });

  // MOBILE MENU OVERLAY
  let overlay = $("#menuOverlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "menuOverlay";
    overlay.className = "menu-overlay";
    document.body.appendChild(overlay);
  }

  function openMenu() {
    if (!sidebar) return;

    sidebar.classList.add("open");
    overlay.classList.add("visible");

    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeMenu() {
    if (!sidebar) return;

    sidebar.classList.remove("open");
    overlay.classList.remove("visible");

    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", event => {
      event.stopPropagation();

      if (sidebar.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // THEME
  function applyTheme(theme) {
    const dark = theme === "dark";

    document.body.classList.toggle("dark", dark);

    if (themeBtn) {
      themeBtn.textContent = dark ? "☀" : "☾";
      themeBtn.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    storage.save("theme", theme);
  }

  const savedTheme = storage.get("theme", "light");
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark")
        ? "light"
        : "dark";

      applyTheme(nextTheme);
    });
  }

  // DATE
  const dateElement = $("#todayDate");

  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  }

  // DASHBOARD TASK PREVIEW
  function renderDashboardTasks() {
    const container = $("#dashboardTasks");
    if (!container) return;

    const tasks = storage.get("tasks", []);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span>✧</span>
          <p>Your little steps start here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.slice(0, 5).map(task => `
      <div class="task-preview">
        <span>${task.completed ? "✓" : "○"}</span>
        <p>${escapeHTML(task.title || "Untitled task")}</p>
      </div>
    `).join("");
  }

  // DASHBOARD STATISTICS
  function updateDashboard() {
    const tasks = storage.get("tasks", []);
    const habits = storage.get("habits", []);
    const goals = storage.get("goals", []);

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeHabits = Array.isArray(habits) ? habits : [];
    const safeGoals = Array.isArray(goals) ? goals : [];

    const completed = safeTasks.filter(
      task => task.completed
    ).length;

    const progress = safeTasks.length
      ? Math.round((completed / safeTasks.length) * 100)
      : 0;

    if ($("#completedCount")) {
      $("#completedCount").textContent = completed;
    }

    if ($("#habitCount")) {
      $("#habitCount").textContent = safeHabits.length;
    }

    if ($("#goalCount")) {
      $("#goalCount").textContent = safeGoals.length;
    }

    if ($("#progressCount")) {
      $("#progressCount").textContent = progress + "%";
    }

    renderDashboardTasks();
  }

  // FIRST PAGE
  const initialPage = location.hash.slice(1);
  showPage(initialPage || "dashboard", false);

  // INITIAL DASHBOARD
  updateDashboard();

  // PUBLIC LUNORA FUNCTIONS
  window.LUNORA = {
    save(key, value) {
      const saved = storage.save(key, value);

      if (saved) updateDashboard();

      return saved;
    },

    get(key, fallback = []) {
      return storage.get(key, fallback);
    },

    updateDashboard,
    showPage,
    escapeHTML
  };

});

