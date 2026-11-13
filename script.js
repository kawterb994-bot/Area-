
/* =====================================
   LUNORA — MAIN JAVASCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTS
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const themeBtn = document.getElementById("themeBtn");
  const navLinks = document.querySelectorAll(".nav-link[data-page]");
  const pages = document.querySelectorAll(".page");
  const pageTitle = document.getElementById("pageTitle");

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

  // NAVIGATION
  function showPage(pageId) {
    const targetPage = document.getElementById(pageId);

    if (!targetPage || !targetPage.classList.contains("page")) {
      pageId = "dashboard";
    }

    pages.forEach(page => {
      page.classList.toggle("active", page.id === pageId);
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.page === pageId
      );
    });

    pageTitle.textContent = titles[pageId] || "LUNORA";

    history.replaceState(null, "", "#" + pageId);

    sidebar.classList.remove("open");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // DASHBOARD QUICK NAVIGATION
  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.go);
    });
  });

  // LOAD PAGE FROM URL
  const initialPage = location.hash.replace("#", "");

  if (initialPage && document.getElementById(initialPage)?.classList.contains("page")) {
    showPage(initialPage);
  }

  // MOBILE MENU
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.addEventListener("click", event => {
    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedMenu = menuBtn.contains(event.target);

    if (
      window.innerWidth <= 768 &&
      !clickedInsideSidebar &&
      !clickedMenu
    ) {
      sidebar.classList.remove("open");
    }
  });

  // DARK MODE
  const savedTheme = localStorage.getItem("lunora-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeBtn.textContent = isDark ? "☀" : "☾";

    localStorage.setItem(
      "lunora-theme",
      isDark ? "dark" : "light"
    );
  });

  // DATE
  const todayDate = document.getElementById("todayDate");

  if (todayDate) {
    todayDate.textContent = new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  }

  // STORAGE HELPER
  const storage = {
    save(key, value) {
      localStorage.setItem(
        "lunora-" + key,
        JSON.stringify(value)
      );
    },

    get(key, fallback = []) {
      try {
        const value = localStorage.getItem("lunora-" + key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    }
  };

  // INITIAL DATA
  const tasks = storage.get("tasks", []);
  const habits = storage.get("habits", []);
  const goals = storage.get("goals", []);

  // DASHBOARD STATISTICS
  function updateDashboard() {
    const completed = tasks.filter(task => task.completed).length;

    const completedCount = document.getElementById("completedCount");
    const habitCount = document.getElementById("habitCount");
    const goalCount = document.getElementById("goalCount");
    const progressCount = document.getElementById("progressCount");

    if (completedCount) {
      completedCount.textContent = completed;
    }

    if (habitCount) {
      habitCount.textContent = habits.length;
    }

    if (goalCount) {
      goalCount.textContent = goals.length;
    }

    if (progressCount) {
      const progress = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

      progressCount.textContent = progress + "%";
    }
  }

  updateDashboard();

  // DASHBOARD TASK PREVIEW
  function renderDashboardTasks() {
    const container = document.getElementById("dashboardTasks");

    if (!container) return;

    const latestTasks = tasks.slice(0, 5);

    if (latestTasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span>✧</span>
          <p>Your little steps start here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = latestTasks.map(task => `
      <div class="task-preview">
        <span>${task.completed ? "✓" : "○"}</span>
        <p>${escapeHTML(task.title)}</p>
      </div>
    `).join("");
  }

  // SAFE TEXT
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  renderDashboardTasks();

  // SAVE DATA HELPER FOR FUTURE PAGES
  window.LUNORA = {
    save: storage.save,
    get: storage.get,
    updateDashboard,
    escapeHTML
  };

});
