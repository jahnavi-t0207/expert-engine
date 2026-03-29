document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("load-more-btn");
  if (!loadBtn) return;

  loadBtn.addEventListener("click", () => {
    
    // Select all currently hidden extra cards
    const hiddenCards = document.querySelectorAll(".flip-card.is-hidden");
    
    // Reveal them with a nice staggered entrance for that hacker load-in effect
    hiddenCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove("is-hidden");
        // Scroll slightly down to inform user more content appeared
        if (index === 0) {
            window.scrollBy({ top: 300, behavior: 'smooth' });
        }
      }, index * 60); // 60ms stagger
    });

    // Update the button state to indicate completion
    loadBtn.innerText = "SYSTEM FULLY LOADED - 100%";
    loadBtn.style.pointerEvents = "none";
    loadBtn.style.opacity = "0.5";
    loadBtn.style.borderColor = "var(--glass-border)";
    loadBtn.style.color = "var(--text-secondary)";
    loadBtn.style.boxShadow = "none";
  });
});
