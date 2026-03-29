let quizData = {};

async function fetchQuizData() {
    try {
        const response = await fetch('http://localhost:3000/api/quizzes');
        quizData = await response.json();
    } catch (err) {
        console.error("Failed to fetch quizzes:", err);
    }
}

let currentDiff = null;
let currentQuestionIndex = 0;
let score = 0;
let activeQuestions = [];

document.addEventListener("DOMContentLoaded", async () => {
  await fetchQuizData();
  const diffCards = document.querySelectorAll(".diff-card");
  diffCards.forEach(card => {
    card.addEventListener("click", () => {
      startQuiz(card.dataset.level);
    });
  });
});

function startQuiz(level) {
  currentDiff = level;
  activeQuestions = quizData[level];
  currentQuestionIndex = 0;
  score = 0;

  document.querySelector(".difficulty-selector").style.display = "none";
  document.querySelector(".quiz-active").style.display = "block";

  showQuestion();
}

function showQuestion() {
  const q = activeQuestions[currentQuestionIndex];
  
  // Update Progress
  const pct = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;
  document.querySelector(".progress-fill").style.width = pct + "%";
  document.querySelector(".page-tag span").innerText = `QUESTION ${currentQuestionIndex + 1}/${activeQuestions.length}`;

  // Populate Question Content
  const container = document.querySelector(".question-card");
  container.innerHTML = `
    <div class="q-text">${q.q}</div>
    <div class="options-grid">
      ${q.o.map((opt, i) => `<div class="option" data-idx="${i}">${opt}</div>`).join('')}
    </div>
  `;

  // Attach Listeners
  const options = container.querySelectorAll(".option");
  options.forEach(opt => {
    opt.addEventListener("click", () => handleAnswer(parseInt(opt.dataset.idx), opt));
  });
}

function handleAnswer(idx, element) {
  const q = activeQuestions[currentQuestionIndex];
  const options = document.querySelectorAll(".option");

  // Disable further clicks
  options.forEach(o => o.style.pointerEvents = "none");

  if (idx === q.a) {
    element.classList.add("correct");
    score++;
  } else {
    element.classList.add("wrong");
    options[q.a].classList.add("correct");
  }

  // Next Question Delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
      showQuestion();
    } else {
      showResult();
    }
  }, 1200);
}

function showResult() {
  document.querySelector(".quiz-active").style.display = "none";
  const resultScreen = document.querySelector(".result-screen");
  resultScreen.style.display = "block";

  const total = activeQuestions.length;
  const pct = (score / total) * 100;
  
  let grade = "C";
  if (pct === 100) grade = "S";
  else if (pct >= 80) grade = "A";
  else if (pct >= 60) grade = "B";

  document.querySelector(".grade-badge").innerText = grade;
  document.querySelector(".grade-badge").className = `grade-badge ${grade}`;
  document.querySelector(".result-screen h1").innerText = `SCORE: ${score}/${total}`;
  document.querySelector(".result-screen p").innerText = `Success accuracy: ${pct}% - Current Tier: ${grade}`;
}

function restartQuiz() {
  document.querySelector(".result-screen").style.display = "none";
  document.querySelector(".difficulty-selector").style.display = "grid";
}
