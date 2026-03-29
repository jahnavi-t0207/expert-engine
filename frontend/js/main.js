import { initViewer } from "./viewer.js";

document.addEventListener("DOMContentLoaded", () => {

  const viewer = document.getElementById("viewer");

  /* ---------- LOAD 3D VIEWER ONLY IF PRESENT ---------- */
  if (viewer) {
    initViewer();
  }

  /* ---------- OPEN VIEWER (used by engines.html buttons) ---------- */
  window.openEngine = function(name) {
    if (name === "V8 Engine") {
      window.location.href = "v8.html";
    } else if (name === "Inline 4 Engine" || name === "Inline 4") {
      window.location.href = "inline4.html";
    } else if (name === "Inline 6 Engine" || name === "Inline 6") {
      window.location.href = "inline6.html";
    }
  };

});