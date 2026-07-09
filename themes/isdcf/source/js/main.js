(function () {
  // Bootstrap 4's dropdown plugin only manages one level. Nested
  // ".dropdown-submenu" toggles (built by _partial/menu.ejs) are opened
  // and closed here instead of navigating to their "#" href.
  document.querySelectorAll(".dropdown-submenu > .dropdown-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var submenu = toggle.parentElement;
      var isOpen = submenu.classList.contains("show");

      submenu.parentElement.querySelectorAll(":scope > .dropdown-submenu.show").forEach(function (sibling) {
        if (sibling !== submenu) {
          sibling.classList.remove("show");
          sibling.querySelector(":scope > .dropdown-toggle").setAttribute("aria-expanded", "false");
        }
      });

      submenu.classList.toggle("show", !isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  document.addEventListener("hidden.bs.dropdown", function (e) {
    e.target.querySelectorAll(".dropdown-submenu.show").forEach(function (submenu) {
      submenu.classList.remove("show");
      submenu.querySelector(":scope > .dropdown-toggle").setAttribute("aria-expanded", "false");
    });
  });
})();
