import { initViewer } from "./viewer.js";
import { EngineAudio } from "./audio.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize 3D Viewer
  initViewer();

  // 2. Initialize Audio System (V8 specific for now)
  const startBtn = document.getElementById("start-btn");
  const revBtn = document.getElementById("rev-btn");

  if (startBtn && revBtn) {
    const audio = new EngineAudio('v8');
    let isStarted = false;

    startBtn.addEventListener("click", () => {
      if (!isStarted) {
        audio.start();
        startBtn.innerHTML = "<span class='rev-icon'>⏹</span> SHUT DOWN";
        startBtn.style.border = "2px solid var(--red)";
        startBtn.style.color = "var(--red)";
        revBtn.disabled = false;
        isStarted = true;
      } else {
        audio.stop();
        startBtn.innerHTML = "<span class='rev-icon'>⚡</span> START ENGINE";
        startBtn.style.border = "2px solid var(--blue)";
        startBtn.style.color = "var(--blue)";
        revBtn.disabled = true;
        isStarted = false;
      }
    });

    revBtn.addEventListener("click", () => {
      audio.rev();
      const viewer = document.querySelector(".canvas-container");
      if (viewer) {
        viewer.classList.add("revving-glow");
        setTimeout(() => viewer.classList.remove("revving-glow"), 1200);
      }
    });
  }

  // 3. Engine Navigation Logic
  const engines = document.querySelectorAll(".dash-engine-portal");
  engines.forEach(eng => {
    eng.addEventListener("click", () => {
      const type = eng.getAttribute("data-engine");
      if (type) window.location.href = `${type}.html`;
    });
  });
});