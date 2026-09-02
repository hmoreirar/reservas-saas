(function () {
  var theme;
  try {
    theme = localStorage.getItem("theme");
  } catch (e) {
    return;
  }
  if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
})();
