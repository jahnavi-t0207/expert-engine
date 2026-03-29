let engineData = {};

async function fetchEngineData() {
    try {
        const response = await fetch('http://localhost:3000/api/engines');
        engineData = await response.json();
        console.log("[API] Loaded engine data successfully.");
    } catch (err) {
        console.error("[API] Failed to fetch engine data:", err);
    }
}

const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

let selectedA = null;
let selectedB = null;
let powerChartInstance = null;

document.addEventListener("DOMContentLoaded", async () => {
  await fetchEngineData();
  const cardsA = document.querySelectorAll("#side-A .select-card");
  const cardsB = document.querySelectorAll("#side-B .select-card");

  cardsA.forEach(card => card.addEventListener("click", () => handleSelect('A', card, cardsA)));
  cardsB.forEach(card => card.addEventListener("click", () => handleSelect('B', card, cardsB)));
});

function handleSelect(side, card, allCards) {
  allCards.forEach(c => c.classList.remove('active'));
  card.classList.add('active');

  const engineId = card.getAttribute('data-engine');
  if (side === 'A') selectedA = engineId;
  if (side === 'B') selectedB = engineId;

  if (selectedA && selectedB) {
    renderComparison();
  }
}

/* ---------- CHART CONCEPTS ---------- */

// Mocks a power/torque curve based on peak values
function generateCurve(peak, peakRpm, limitRpm = 8000) {
  const data = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const rpm = 1000 + (i * (limitRpm - 1000) / steps);
    // Parabolic curve reaching peak at peakRpm
    // (peak - base) * (1 - ((rpm - peakRpm) / peakRpm)^2) + base
    const base = peak * 0.3;
    const value = (peak - base) * (1 - Math.pow((rpm - peakRpm) / peakRpm, 2)) + base;
    data.push(Math.max(base, Math.round(value)));
  }
  return data;
}

function updateChart(engA, engB) {
  const ctx = document.getElementById('powerChart').getContext('2d');
  const labels = [];
  for (let i = 0; i <= 15; i++) labels.push(1000 + (i * 7000 / 15));

  // Determine peak targets based on engine type
  const getPeakRpm = (name) => name.toLowerCase().includes('rotary') ? 7000 : 5500;
  const getTorquePeakRpm = (name) => name.toLowerCase().includes('v8') ? 3500 : 4500;

  const dataA_HP = generateCurve(engA.hp, getPeakRpm(engA.name));
  const dataB_HP = generateCurve(engB.hp, getPeakRpm(engB.name));
  const dataA_TQ = generateCurve(engA.torque * 50, getTorquePeakRpm(engA.name)); // scale index for chart
  const dataB_TQ = generateCurve(engB.torque * 50, getTorquePeakRpm(engB.name));

  if (powerChartInstance) {
    powerChartInstance.destroy();
  }

  powerChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: `${engA.name} (HP)`, data: dataA_HP, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 3, tension: 0.4, fill: true },
        { label: `${engB.name} (HP)`, data: dataB_HP, borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 3, tension: 0.4, fill: true },
        { label: `${engA.name} (Torque)`, data: dataA_TQ, borderColor: '#ef4444', borderDash: [5, 5], borderWidth: 1, tension: 0.4, fill: false },
        { label: `${engB.name} (Torque)`, data: dataB_TQ, borderColor: '#94a3b8', borderDash: [5, 5], borderWidth: 1, tension: 0.4, fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#475569' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#475569' } }
      }
    }
  });

  document.getElementById('chart-section').style.display = 'block';
}

function renderComparison() {
  const container = document.getElementById("comparison-results");
  const a = engineData[selectedA];
  const b = engineData[selectedB];

  let scoreA = 0;
  let scoreB = 0;

  const compareRow = (label, valA, valB, formatFn, lowerIsBetter = false) => {
    let rawA = valA;
    let rawB = valB;
    let winA = lowerIsBetter ? (rawA < rawB) : (rawA > rawB);
    let winB = lowerIsBetter ? (rawB < rawA) : (rawB > rawA);
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

  const hpFormat = (v) => v + " HP";
  const dispFormat = (v) => v.toFixed(1) + " L";
  const indexFormat = (v) => v + "/10";

  let html = `
    <div class="results-header">
      <h2>${a.name} <span class="vs-text">vs</span> ${b.name}</h2>
    </div>
    ${compareRow('Max Horsepower', a.hp, b.hp, hpFormat)}
    ${compareRow('Displacement', a.disp, b.disp, dispFormat)}
    ${compareRow('Fuel Efficiency', a.efficient, b.efficient, indexFormat)}
    ${compareRow('Smoothness', a.smooth, b.smooth, indexFormat)}
    ${compareRow('Torque Index', a.torque, b.torque, indexFormat)}
    ${compareRow('Lightness Index', a.lightness, b.lightness, indexFormat)}
    ${compareRow('Cost (INR)', a.cost, b.cost, formatINR, true)}
  `;

  let finalWinnerHtml = scoreA > scoreB ? `<h3>🏆 ${a.name} Wins Globally!</h3>` : (scoreB > scoreA ? `<h3>🏆 ${b.name} Wins Globally!</h3>` : "<h3>⚖️ It's a Tie!</h3>");

  html += `<div class="final-winner-box">${finalWinnerHtml}</div>`;

  const listToHtml = (arr) => `<ul>${arr.map(item => `<li>${item}</li>`).join('')}</ul>`;

  html += `
    <div class="compare-pros-cons">
      <div>
        <div class="pros"><h4>${a.name} Pros</h4>${listToHtml(a.pros)}</div>
        <div class="cons" style="margin-top:20px;"><h4>${a.name} Cons</h4>${listToHtml(a.cons)}</div>
      </div>
      <div>
        <div class="pros"><h4>${b.name} Pros</h4>${listToHtml(b.pros)}</div>
        <div class="cons" style="margin-top:20px;"><h4>${b.name} Cons</h4>${listToHtml(b.cons)}</div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  container.style.display = "block";
  
  // Power Curve Update
  updateChart(a, b);
  
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
