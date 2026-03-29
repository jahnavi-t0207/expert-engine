document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("load-more-btn");
  if (!loadBtn) return;

  // Show a counter badge on the button indicating how many are locked
  const hiddenCount = document.querySelectorAll(".flip-card.is-hidden").length;
  loadBtn.innerHTML = `Load Full Schematic <span id="unlock-badge">+${hiddenCount} Modules</span>`;

  // Inject badge style
  const s = document.createElement("style");
  s.textContent = `
    #unlock-badge {
      display: inline-block;
      background: rgba(56,189,248,0.2);
      border: 1px solid rgba(56,189,248,0.4);
      color: #38bdf8;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 11px;
      letter-spacing: 1px;
      margin-left: 10px;
      vertical-align: middle;
      font-weight: 700;
    }
    .flip-card.unlocking {
      animation: unlockPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes unlockPop {
      0% { opacity: 0; transform: scale(0.8) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    #parts-progress-bar {
      width: 100%;
      height: 3px;
      background: rgba(56,189,248,0.1);
      border-radius: 2px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    #parts-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      width: 46%; /* 12 out of 26 visible initially = ~46% */
      transition: width 1.5s ease;
      box-shadow: 0 0 8px rgba(56,189,248,0.5);
    }
  `;
  document.head.appendChild(s);

  // Inject progress bar above the grid
  const grid = document.getElementById("parts-grid");
  if (grid) {
    const bar = document.createElement("div");
    bar.id = "parts-progress-bar";
    bar.innerHTML = `<div id="parts-progress-fill"></div>`;
    grid.parentNode.insertBefore(bar, grid);
  }

  loadBtn.addEventListener("click", () => {
    const hiddenCards = document.querySelectorAll(".flip-card.is-hidden");
    const total = document.querySelectorAll(".flip-card").length;
    let revealed = 0;

    hiddenCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove("is-hidden");
        card.classList.add("unlocking");
        revealed++;

        // Update badge counter in real-time
        const badge = document.getElementById("unlock-badge");
        if (badge) {
          const remaining = hiddenCards.length - revealed;
          badge.textContent = remaining > 0 ? `+${remaining} Remaining` : "LOADED ✓";
        }

        // Scroll on first reveal
        if (index === 0) {
          window.scrollBy({ top: 300, behavior: "smooth" });
        }

        // On final card - fill progress bar, update button
        if (index === hiddenCards.length - 1) {
          const fill = document.getElementById("parts-progress-fill");
          if (fill) fill.style.width = "100%";

          setTimeout(() => {
            loadBtn.innerHTML = `SYSTEM FULLY LOADED <span style="color:#10b981;">✓ ALL ${total} MODULES</span>`;
            loadBtn.style.pointerEvents = "none";
            loadBtn.style.opacity = "0.6";
            loadBtn.style.borderColor = "rgba(16,185,129,0.3)";
          }, 800);
        }
      }, index * 70);
    });
  });
});
