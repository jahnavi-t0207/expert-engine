let engineData = {};

/**
 * FETCH ENGINE DATA
 * Prioritizes the local API if available, falls back to static JSON.
 */
async function fetchEngineData() {
    try {
        // Try the local API first (server-based)
        const response = await fetch('http://localhost:3000/api/engines');
        if (!response.ok) throw new Error("API not responding");
        engineData = await response.json();
    } catch (err) {
        console.warn("[REVO-ENGINE] API Offline. Fetching local data cache...");
        try {
            // Fallback to the physical JSON file in the backend folder
            // Use correct relative path from frontend directory
            const fallback = await fetch('../backend/data/engines.json');
            engineData = await fallback.json();
        } catch (fbErr) {
            console.error("[REVO-ENGINE] Critical: Could not load engine data.", fbErr);
        }
    }
}

const formatINR = (num) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
}).format(num);

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
        const results = document.getElementById("comparison-results");
        const chart = document.getElementById("chart-section");

        // 1. Initial State
        results.style.display = "block";
        results.style.opacity = "0.2";
        results.style.filter = "blur(10px)";
        
        // 2. High-Tech Scanning Delay
        const header = document.querySelector(".results-header h2");
        if (header) header.textContent = "SYNCHRONIZING DATA...";

        setTimeout(() => {
            results.style.opacity = "1";
            results.style.filter = "blur(0)";
            renderComparison();
            
            // 3. Smooth entrance for the chart too
            if (chart) {
                chart.style.opacity = "0";
                chart.style.display = "block";
                setTimeout(() => {
                    chart.style.transition = "opacity 0.8s ease";
                    chart.style.opacity = "1";
                }, 100);
            }
        }, 800);
    }
}

/* ---------- CHART CONCEPTS ---------- */

// Mocks a power/torque curve based on peak values with realistic slope
function generateCurve(peak, peakRpm, limitRpm = 8000) {
    const data = [];
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
        const rpm = 1000 + (i * (limitRpm - 1000) / steps);
        const base = peak * 0.25;
        // Bell curve focused on peakRpm
        const value = (peak - base) * Math.exp(-Math.pow(rpm - peakRpm, 2) / (2 * Math.pow(peakRpm * 0.6, 2))) + base;
        data.push(Math.max(base, Math.round(value)));
    }
    return data;
}

function updateChart(engA, engB) {
    const ctx = document.getElementById('powerChart').getContext('2d');
    const labels = [];
    for (let i = 0; i <= 15; i++) labels.push((1000 + (i * 7000 / 15)).toLocaleString() + " RPM");

    const getPeakRpm = (name) => name.toLowerCase().includes('rotary') ? 7000 : 6500;
    const getTorquePeakRpm = (name) => name.toLowerCase().includes('v8') ? 3500 : 4500;

    const dataA_HP = generateCurve(engA.hp, getPeakRpm(engA.name));
    const dataB_HP = generateCurve(engB.hp, getPeakRpm(engB.name));
    const dataA_TQ = generateCurve(engA.torque * 40, getTorquePeakRpm(engA.name)); 
    const dataB_TQ = generateCurve(engB.torque * 40, getTorquePeakRpm(engB.name));

    if (powerChartInstance) {
        powerChartInstance.destroy();
    }

    powerChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: `${engA.name}`, data: dataA_HP, borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 4, tension: 0.4, fill: true, pointRadius: 0 },
                { label: `${engB.name}`, data: dataB_HP, borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.05)', borderWidth: 4, tension: 0.4, fill: true, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Outfit', weight: '700' } } },
                tooltip: { backgroundColor: '#0f172a', titleColor: '#38bdf8', bodyColor: '#fff', padding: 15, cornerRadius: 10 }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#475569' } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#475569' } }
            }
        }
    });

    document.getElementById('chart-section').style.display = 'block';
}

function renderComparison() {
    const container = document.getElementById("comparison-results");
    const a = engineData[selectedA];
    const b = engineData[selectedB];

    if (!a || !b) return;

    let scoreA = 0;
    let scoreB = 0;

    const compareRow = (label, valA, valB, formatFn, lowerIsBetter = false) => {
        let winA = lowerIsBetter ? (valA < valB) : (valA > valB);
        let winB = lowerIsBetter ? (valB < valA) : (valB > valA);
        if (winA) scoreA++;
        if (winB) scoreB++;

        const displayA = formatFn ? formatFn(valA) : valA;
        const displayB = formatFn ? formatFn(valB) : valB;

        return `
            <div class="compare-row">
                <div class="compare-item side-A-item ${winA ? 'winner-text' : ''}">
                    ${displayA} ${winA ? '<span class="winner-badge">Winner</span>' : ''}
                </div>
                <div class="compare-label">${label}</div>
                <div class="compare-item side-B-item ${winB ? 'winner-text' : ''}">
                    ${winB ? '<span class="winner-badge">Winner</span>' : ''} ${displayB}
                </div>
            </div>
        `;
    };

    const hpFormat = (v) => v + " HP";
    const dispFormat = (v) => v.toFixed(1) + " L";
    const indexFormat = (v) => v + "/10";

    let html = `
        <div class="results-header">
            <div class="page-tag" style="margin-bottom:10px;">SYSTEM MATCH ANALYSIS</div>
            <h2>${a.name} <span class="vs-text">VS</span> ${b.name}</h2>
        </div>
        ${compareRow('Mechanical Force', a.hp, b.hp, hpFormat)}
        ${compareRow('Total Displacement', a.disp, b.disp, dispFormat)}
        ${compareRow('Thermal Efficiency', a.efficient, b.efficient, indexFormat)}
        ${compareRow('Mechanical Balance', a.smooth, b.smooth, indexFormat)}
        ${compareRow('Torque Stability', a.torque, b.torque, indexFormat)}
        ${compareRow('Mass Reduction', a.lightness, b.lightness, indexFormat)}
        ${compareRow('Procurement Cost', a.cost, b.cost, formatINR, true)}
    `;

    let finalWinnerHtml = scoreA > scoreB ? 
        `<h3 style="color:var(--blue);">🏆 ${a.name.toUpperCase()} DOMINATES MATCHUP</h3>` : 
        (scoreB > scoreA ? `<h3 style="color:var(--blue);">🏆 ${b.name.toUpperCase()} DOMINATES MATCHUP</h3>` : 
        "<h3>⚖️ TECHNICAL TIE ACHIEVED</h3>");

    html += `<div class="final-winner-box">${finalWinnerHtml}</div>`;

    const listToHtml = (arr) => `<ul>${arr.map(item => `<li>${item}</li>`).join('')}</ul>`;

    html += `
        <div class="compare-pros-cons">
            <div class="pros">
                <h4>PROS // PERFORMANCE</h4>
                ${listToHtml(a.pros)}
                <div class="cons" style="margin-top:30px;">
                    <h4>CONS // LIMITATIONS</h4>
                    ${listToHtml(a.cons)}
                </div>
            </div>
            <div class="pros">
                <h4>PROS // PERFORMANCE</h4>
                ${listToHtml(b.pros)}
                <div class="cons" style="margin-top:30px;">
                    <h4>CONS // LIMITATIONS</h4>
                    ${listToHtml(b.cons)}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.style.display = "block";
    updateChart(a, b);
    
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
