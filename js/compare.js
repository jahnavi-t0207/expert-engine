const engineData = {
  v8: {
    name: "V8 Engine",
    hp: 700,
    disp: 6.5,
    efficient: 4,
    smooth: 8,
    torque: 9,
    lightness: 3,
    cost: 1200000,
    pros: ["High power output", "Smooth performance", "Great for performance"],
    cons: ["High fuel consumption", "Heavier design", "More complex"]
  },
  v6: {
    name: "V6 Engine",
    hp: 400,
    disp: 4.0,
    efficient: 6,
    smooth: 7,
    torque: 7,
    lightness: 5,
    cost: 800000,
    pros: ["Good power balance", "Compact vs V8", "Widely available"],
    cons: ["More expensive than I4", "More complex"]
  },
  i4: {
    name: "Inline 4",
    hp: 250,
    disp: 2.5,
    efficient: 9,
    smooth: 5,
    torque: 5,
    lightness: 8,
    cost: 350000,
    pros: ["Fuel efficient", "Lightweight", "Simple design"],
    cons: ["Lower power", "More vibration"]
  },
  i6: {
    name: "Inline 6",
    hp: 500,
    disp: 3.8,
    efficient: 6,
    smooth: 10,
    torque: 8,
    lightness: 4,
    cost: 1500000,
    pros: ["Naturally balanced", "Very smooth", "High torque"],
    cons: ["Long engine bay needed", "Higher cost"]
  },
  boxer: {
    name: "Boxer",
    hp: 400,
    disp: 3.6,
    efficient: 6,
    smooth: 8,
    torque: 6,
    lightness: 6,
    cost: 1000000,
    pros: ["Low center of gravity", "Balanced vibration", "Good handling"],
    cons: ["Wide layout", "Hard to service"]
  },
  rotary: {
    name: "Rotary",
    hp: 300,
    disp: 1.3,
    efficient: 2,
    smooth: 9,
    torque: 4,
    lightness: 9,
    cost: 900000,
    pros: ["High rev ceiling", "Compact & light", "Very smooth"],
    cons: ["Poor fuel economy", "High oil consumption"]
  }
};

// Formatting INR currency
const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

let selectedA = null;
let selectedB = null;

document.addEventListener("DOMContentLoaded", () => {
  const cardsA = document.querySelectorAll("#side-A .select-card");
  const cardsB = document.querySelectorAll("#side-B .select-card");

  cardsA.forEach(card => card.addEventListener("click", () => handleSelect('A', card, cardsA)));
  cardsB.forEach(card => card.addEventListener("click", () => handleSelect('B', card, cardsB)));
});

function handleSelect(side, card, allCards) {
  // Update visually
  allCards.forEach(c => c.classList.remove('active'));
  card.classList.add('active');

  // Update State
  const engineId = card.getAttribute('data-engine');
  if (side === 'A') selectedA = engineId;
  if (side === 'B') selectedB = engineId;

  // Render if both selected
  if (selectedA && selectedB) {
    renderComparison();
  }
}

function renderComparison() {
  const container = document.getElementById("comparison-results");
  const a = engineData[selectedA];
  const b = engineData[selectedB];

  let scoreA = 0;
  let scoreB = 0;

  // Helper to determine winner row HTML
  const compareRow = (label, valA, valB, formatFn, lowerIsBetter = false) => {
    let rawA = valA;
    let rawB = valB;
    
    let winA = lowerIsBetter ? (rawA < rawB) : (rawA > rawB);
    let winB = lowerIsBetter ? (rawB < rawA) : (rawB > rawA);
    let tie = rawA === rawB;

    if (winA) scoreA++;
    if (winB) scoreB++;

    const displayA = formatFn ? formatFn(valA) : valA;
    const displayB = formatFn ? formatFn(valB) : valB;

    return `
      <div class="compare-row">
        <div class="compare-item ${winA ? 'winner-text' : ''}">
          ${displayA} ${winA ? '<span class="winner-badge">Winner</span>' : ''}
        </div>
        <div class="compare-label">${label}</div>
        <div class="compare-item ${winB ? 'winner-text' : ''}">
          ${displayB} ${winB ? '<span class="winner-badge">Winner</span>' : ''}
        </div>
      </div>
    `;
  };

  const genericFormat = (v) => v;
  const hpFormat = (v) => v + " HP";
  const dispFormat = (v) => v.toFixed(1) + " L";
  const indexFormat = (v) => v + "/10";

  let html = `
    <div class="results-header">
      <h2>${a.name} <span class="vs-text">vs</span> ${b.name}</h2>
    </div>

    <!-- The Stats Rows -->
    ${compareRow('Max Horsepower', a.hp, b.hp, hpFormat)}
    ${compareRow('Displacement', a.disp, b.disp, dispFormat)}
    ${compareRow('Fuel Efficiency', a.efficient, b.efficient, indexFormat)}
    ${compareRow('Smoothness', a.smooth, b.smooth, indexFormat)}
    ${compareRow('Torque Index', a.torque, b.torque, indexFormat)}
    ${compareRow('Lightness Index', a.lightness, b.lightness, indexFormat)}
    ${compareRow('Cost (INR)', a.cost, b.cost, formatINR, true /* lower is better */)}
  `;

  // Determine Overall Winner
  let finalWinnerHtml = "";
  if (scoreA > scoreB) {
    finalWinnerHtml = `<h3>🏆 ${a.name} Wins Globally!</h3><p>With ${scoreA} category wins, it outperforms overall in these raw metrics.</p>`;
  } else if (scoreB > scoreA) {
    finalWinnerHtml = `<h3>🏆 ${b.name} Wins Globally!</h3><p>With ${scoreB} category wins, it outperforms overall in these raw metrics.</p>`;
  } else {
    finalWinnerHtml = `<h3>⚖️ It's a Tie!</h3><p>Both engines balance each other out perfectly across these metrics.</p>`;
  }

  html += `
    <div class="final-winner-box">
      ${finalWinnerHtml}
    </div>
  `;

  // Pros & Cons Side-by-Side
  const listToHtml = (arr) => `<ul>${arr.map(item => `<li>${item}</li>`).join('')}</ul>`;

  html += `
    <div class="compare-pros-cons">
      <div>
        <div class="pros">
          <h4>${a.name} Pros</h4>
          ${listToHtml(a.pros)}
        </div>
        <div class="cons" style="margin-top:20px;">
          <h4>${a.name} Cons</h4>
          ${listToHtml(a.cons)}
        </div>
      </div>
      
      <div>
        <div class="pros">
          <h4>${b.name} Pros</h4>
          ${listToHtml(b.pros)}
        </div>
        <div class="cons" style="margin-top:20px;">
          <h4>${b.name} Cons</h4>
          ${listToHtml(b.cons)}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  container.style.display = "block";
  
  // Scroll into view gently
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
