(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  var year = document.querySelector("[data-year]");

  if (year) year.textContent = String(new Date().getFullYear());

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("nav-open", open);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setNav(false);
  });

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var filters = document.querySelectorAll("[data-filter]");
  var projects = document.querySelectorAll("[data-category]");
  var count = document.querySelector("[data-count]");
  var empty = document.querySelector("[data-empty]");

  function applyFilter(name) {
    var visible = 0;
    projects.forEach(function (project) {
      var show = name === "all" || project.dataset.category === name;
      project.hidden = !show;
      if (show) visible += 1;
    });
    if (count) {
      count.textContent = visible === 1 ? "1 project" : visible + " projects";
    }
    if (empty) empty.hidden = visible !== 0;
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      filters.forEach(function (item) {
        item.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
      applyFilter(button.dataset.filter || "all");
    });
  });

  var dialog = document.querySelector("[data-dialog]");
  var dialogTitle = document.querySelector("[data-dialog-title]");
  var dialogKicker = document.querySelector("[data-dialog-kicker]");
  var dialogSummary = document.querySelector("[data-dialog-summary]");
  var dialogScope = document.querySelector("[data-dialog-scope]");

  projects.forEach(function (project) {
    project.addEventListener("click", function () {
      if (!dialog || typeof dialog.showModal !== "function") return;
      dialogTitle.textContent = project.dataset.title || "";
      dialogKicker.textContent = project.dataset.kicker || "";
      dialogSummary.textContent = project.dataset.summary || "";
      dialogScope.textContent = project.dataset.scope || "";
      dialog.showModal();
    });
  });

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  var closeDialog = document.querySelector("[data-dialog-close]");
  if (closeDialog && dialog) {
    closeDialog.addEventListener("click", function () {
      dialog.close();
    });
  }

  var form = document.querySelector("[data-form]");
  var status = document.querySelector("[data-form-status]");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var organization = String(data.get("organization") || "").trim();
      var interest = String(data.get("interest") || "").trim();
      var message = String(data.get("message") || "").trim();
      var subject = "Project inquiry from " + name;
      var body = [
        "Name: " + name,
        "Email: " + email,
        "Organization: " + (organization || "—"),
        "Interest: " + interest,
        "",
        message,
      ].join("\n");

      if (status) {
        status.textContent =
          "Your email app should open with this inquiry. If it does not, write to hello@axion.engineering.";
      }

      window.location.href =
        "mailto:hello@axion.engineering?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });
  }
})();
