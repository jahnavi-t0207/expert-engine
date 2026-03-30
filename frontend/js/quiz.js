document.addEventListener("DOMContentLoaded", () => {
  let quizData = null;
  let currentLevel = null;
  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;

  const diffSelector = document.querySelector(".difficulty-selector");
  const quizActive = document.querySelector(".quiz-active");
  const resultScreen = document.querySelector(".result-screen");
  const questionCard = document.getElementById("question-card");
  const progressBar = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".quiz-active .page-tag span");

  /* ---------- FETCH QUIZ DATA ---------- */
  async function loadQuizData() {
    try {
      const response = await fetch("backend/data/quizzes.json");
      quizData = await response.json();
    } catch (err) {
      console.error("Failed to load quiz data:", err);
      // Fallback if fetch fails
      quizData = {
        easy: [{ q: "What component moves inside the cylinder?", o: ["Piston", "Crankshaft"], a: 0 }]
      };
    }
  }
  loadQuizData();

  /* ---------- START QUIZ ---------- */
  document.querySelectorAll(".diff-card").forEach(card => {
    card.addEventListener("click", () => {
      currentLevel = card.dataset.level;
      currentQuestions = quizData[currentLevel];
      currentIndex = 0;
      score = 0;
      
      diffSelector.style.display = "none";
      quizActive.style.display = "block";
      showQuestion();
    });
  });

  function showQuestion() {
    if (currentIndex >= currentQuestions.length) {
      showResults();
      return;
    }

    const q = currentQuestions[currentIndex];
    
    // Update Progress
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `QUESTION ${currentIndex + 1}/${currentQuestions.length}`;

    // Render Question
    questionCard.innerHTML = `
      <h2 class="q-text">${q.q}</h2>
      <div class="options-grid">
        ${q.o.map((opt, i) => `
          <div class="option" data-idx="${i}">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            ${opt}
          </div>
        `).join("")}
      </div>
    `;

    // Add Click Listeners
    questionCard.querySelectorAll(".option").forEach(opt => {
      opt.addEventListener("click", () => handleAnswer(opt));
    });

    // Animation
    questionCard.style.animation = "none";
    questionCard.offsetHeight; /* trigger reflow */
    questionCard.style.animation = "slideUp 0.5s ease forwards";
  }

  function handleAnswer(selectedOpt) {
    const correctIdx = currentQuestions[currentIndex].a;
    const selectedIdx = parseInt(selectedOpt.dataset.idx);
    
    // Disable all options
    questionCard.querySelectorAll(".option").forEach(opt => {
      opt.style.pointerEvents = "none";
      const idx = parseInt(opt.dataset.idx);
      if (idx === correctIdx) opt.classList.add("correct");
    });

    if (selectedIdx === correctIdx) {
      score++;
    } else {
      selectedOpt.classList.add("wrong");
    }

    currentIndex++;
    setTimeout(showQuestion, 1500);
  }

  function showResults() {
    quizActive.style.display = "none";
    resultScreen.style.display = "block";
    
    const percentage = (score / currentQuestions.length) * 100;
    let grade = "C";
    let message = "Keep studying the schematics.";

    if (percentage === 100) { grade = "S"; message = "Perfect completion. Master Engineer status achieved."; }
    else if (percentage >= 80) { grade = "A"; message = "Excellent performance. High technical accuracy."; }
    else if (percentage >= 60) { grade = "B"; message = "Solid knowledge base. Room for optimization."; }

    resultScreen.querySelector(".grade-badge").textContent = grade;
    resultScreen.querySelector(".grade-badge").className = `grade-badge ${grade}`;
    resultScreen.querySelector("h1").textContent = `SCORE: ${score}/${currentQuestions.length}`;
    resultScreen.querySelector("p").textContent = message;
  }

  window.restartQuiz = () => {
    resultScreen.style.display = "none";
    diffSelector.style.display = "grid";
  };
});
