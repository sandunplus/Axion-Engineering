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
        if (drop) {
          drop.classList.remove("is-open");
          if (dropBtn) dropBtn.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  var drop = document.querySelector("[data-drop]");
  var dropBtn = drop ? drop.querySelector(".nav-drop-btn") : null;

  if (drop && dropBtn) {
    dropBtn.addEventListener("click", function () {
      var open = drop.classList.toggle("is-open");
      dropBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (event) {
      if (!drop.contains(event.target)) {
        drop.classList.remove("is-open");
        dropBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    setNav(false);
    if (drop && dropBtn) {
      drop.classList.remove("is-open");
      dropBtn.setAttribute("aria-expanded", "false");
    }
  });

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    function playReveal(el) {
      var token = (el._revealToken || 0) + 1;
      el._revealToken = token;
      el.classList.remove("is-visible");
      void el.offsetWidth;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (el._revealToken !== token || !el._inView) return;
          el.classList.add("is-visible");
        });
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          el._inView = entry.isIntersecting;
          if (!entry.isIntersecting) {
            el._revealToken = (el._revealToken || 0) + 1;
            el.classList.remove("is-visible");
            return;
          }
          var img = el._revealImg;
          if (img && !img.complete) return;
          if (el.classList.contains("is-visible")) return;
          playReveal(el);
        });
      },
      { threshold: 0.22, rootMargin: "0px 0px -10% 0px" }
    );

    reveals.forEach(function (el) {
      var img = null;
      if (el.classList.contains("reveal-image")) {
        img = el.querySelector("img:not([aria-hidden='true'])");
      }
      el._revealImg = img;
      if (img && !img.complete) {
        img.addEventListener(
          "load",
          function () {
            if (el._inView) playReveal(el);
          },
          { once: true }
        );
      }
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
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
      var office = String(data.get("office") || "sajith@axioneng.com").trim();
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
          "Your email app should open with this inquiry. If it does not, write to " + office + ".";
      }

      window.location.href =
        "mailto:" +
        encodeURIComponent(office) +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });
  }

  var hero = document.querySelector(".hero");
  var plate = document.querySelector(".hero-tilt");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (hero && plate && !reduceMotion && finePointer) {
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var frameId = 0;

    function paintCube() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      var rotateY = currentX * 9;
      var rotateX = currentY * -7;
      plate.style.transform =
        "rotateX(" +
        rotateX.toFixed(2) +
        "deg) rotateY(" +
        rotateY.toFixed(2) +
        "deg) translate3d(" +
        (currentX * 14).toFixed(1) +
        "px, " +
        (currentY * 10).toFixed(1) +
        "px, 0)";
      if (Math.abs(targetX - currentX) > 0.004 || Math.abs(targetY - currentY) > 0.004) {
        frameId = window.requestAnimationFrame(paintCube);
      } else {
        frameId = 0;
      }
    }

    function aim(event) {
      var rect = hero.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;
      if (!frameId) frameId = window.requestAnimationFrame(paintCube);
    }

    hero.addEventListener("pointermove", aim);
    hero.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      if (!frameId) frameId = window.requestAnimationFrame(paintCube);
    });
  }
})();
