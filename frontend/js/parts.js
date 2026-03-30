document.addEventListener("DOMContentLoaded", () => {
  const partsGrid = document.getElementById("parts-grid");
  const searchInput = document.getElementById("parts-search");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const loadBtn = document.getElementById("load-more-btn");

  if (!partsGrid) return;

  /* ---------- RENDER "VIEW IN ENGINE" BUTTONS ---------- */
  function addViewerLinks() {
    const cards = document.querySelectorAll(".flip-card-back");
    cards.forEach(card => {
      const title = card.querySelector(".back-title").textContent.trim();
      if (!card.querySelector(".view-engine-btn")) {
        const link = document.createElement("a");
        link.href = `v8.html?part=${encodeURIComponent(title)}`;
        link.className = "view-engine-btn";
        link.innerHTML = "🔍 View in 3D Engine";
        card.appendChild(link);
      }
    });
  }
  addViewerLinks();

  /* ---------- SEARCH LOGIC ---------- */
  function updateFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeCategory = document.querySelector(".filter-btn.active").dataset.category;
    const cards = document.querySelectorAll(".flip-card");

    cards.forEach(card => {
      const title = card.querySelector(".front-title").textContent.toLowerCase();
      const desc = card.querySelector(".back-desc").textContent.toLowerCase();
      const category = card.querySelector(".front-sys").textContent.trim();
      
      const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
      const matchesCategory = activeCategory === "all" || category === activeCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = "block";
        card.style.animation = "cardAppear 0.4s ease forwards";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateFilters);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateFilters();
    });
  });

  /* ---------- LOAD MORE LOGIC (Integrated) ---------- */
  if (loadBtn) {
    const hiddenCount = document.querySelectorAll(".flip-card.is-hidden").length;
    loadBtn.innerHTML = `Load Full Schematic / +${hiddenCount} Modules`;

    loadBtn.addEventListener("click", () => {
      const hiddenCards = document.querySelectorAll(".flip-card.is-hidden");
      hiddenCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.remove("is-hidden");
          card.style.animation = "cardAppear 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards";
          if (index === hiddenCards.length - 1) {
            loadBtn.style.display = "none";
            updateFilters(); // Re-apply current search/filter to newly shown cards
          }
        }, index * 50);
      });
    });
  }
});
