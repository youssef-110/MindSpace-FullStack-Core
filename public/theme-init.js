try {
  var t = localStorage.getItem("theme");
  if (t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.classList.add("dark");
} catch {
  /* storage blocked: fall back to the light theme */
}
