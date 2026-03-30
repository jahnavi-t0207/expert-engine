/**
 * REVORA - PART COMPARATOR LOGIC (DEBUGGED)
 * Interactive engineering analysis for mechanical components.
 */

const partsData = {
    piston: {
        name: "Piston (High Compression)",
        function: "Compresses fuel/air and transfers expansion force to the rod.",
        location: "Inside Cylinder Bore",
        motion: "Linear (Reciprocating)",
        material: "Forged Aluminum / Ceramic Coating",
        system: "Core / Combustion",
        complexity: 3,
        heat: 3,
        wear: 2
    },
    crankshaft: {
        name: "Crankshaft (Precision Cast)",
        function: "Converts linear motion to rotational torque.",
        location: "Lower Engine Block",
        motion: "Rotational",
        material: "Billet Steel / Nodular Iron",
        system: "Core / Powertrain",
        complexity: 3,
        heat: 1,
        wear: 1
    },
    camshaft: {
        name: "Camshaft (Billet)",
        function: "Timed lobe rotation opens and closes the valvetrain.",
        location: "Cylinder Head / Block (OHV/OHC)",
        motion: "Rotational",
        material: "Hardened Steel / Cast Iron",
        system: "Valve System",
        complexity: 2,
        heat: 1,
        wear: 1
    },
    valves: {
        name: "Valves (Sodium Filled)",
        function: "Pneumatic gates for air/fuel intake and exhaust flow.",
        location: "Cylinder Head",
        motion: "Linear (Axial)",
        material: "Titanium / Stainless Steel",
        system: "Valve System",
        complexity: 2,
        heat: 3,
        wear: 2
    },
    sparkplug: {
        name: "Spark Plug (Iridium)",
        function: "Generates electrical arc to ignite the compressed mixture.",
        location: "Top of Cylinder Head",
        motion: "None (Stationary)",
        material: "Ceramic / Iridium Tip",
        system: "Ignition System",
        complexity: 1,
        heat: 3,
        wear: 3
    },
    oilpump: {
        name: "Oil Pump (High Volume)",
        function: "Pressurizes lubricant to reduce friction across modules.",
        location: "Sump / Internal Oil Gallery",
        motion: "Rotational (Gear)",
        material: "Cast Aluminum / Sintered Steel",
        system: "Lubrication",
        complexity: 2,
        heat: 1,
        wear: 1
    },
    connecting_rod: {
        name: "Connecting Rod (H-Beam)",
        function: "Bridges the piston and crankshaft to transmit power.",
        location: "Between Piston and Crankshaft",
        motion: "Oscillating / Reciprocating",
        material: "Forged Chromoly Steel",
        system: "Core / Powertrain",
        complexity: 2,
        heat: 2,
        wear: 2
    },
    cylinder_head: {
        name: "Cylinder Head (Ported)",
        function: "Seals combustion and houses valves and camshafts.",
        location: "Top of Engine Block",
        motion: "None (Structural)",
        material: "Cast Aluminum / Magnesium",
        system: "Core / Structural",
        complexity: 3,
        heat: 3,
        wear: 1
    }
};

let activeChart = null;
let chartType = "bar";

// SAFETY INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    console.log("%c[REVORA]%c Initializing Core Modules...", "color:#38bdf8; font-weight:bold", "");
    
    // Ensure selectors exist before populating
    if (document.getElementById("part-select-1")) {
        initSelectors();
    } else {
        console.error("[REVORA] Selectors not found. Initialization aborted.");
        return;
    }

    // Event Listeners
    const compareBtn = document.getElementById("compare-btn");
    const clearBtn = document.getElementById("clear-btn");

    if (compareBtn) compareBtn.addEventListener("click", runAnalysis);
    if (clearBtn) clearBtn.addEventListener("click", resetAnalysis);

    document.querySelectorAll(".chart-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".chart-toggle").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            chartType = btn.dataset.type;
            if (activeChart) runAnalysis();
        });
    });

    // Auto-populate 2 parts for immediate feedback
    const s1 = document.getElementById("part-select-1");
    const s2 = document.getElementById("part-select-2");
    if (s1 && s2) {
        s1.value = "piston";
        s2.value = "crankshaft";
        
        // Wait 200ms for browser to render selectors before analysis
        setTimeout(runAnalysis, 200);
    }
});

function initSelectors() {
    const selects = ["part-select-1", "part-select-2", "part-select-3", "part-select-4"];

    selects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        // Clear existing options (except default)
        select.innerHTML = '<option value="">Select Part...</option>';
        
        for (const key in partsData) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = partsData[key].name;
            select.appendChild(opt);
        }
    });
}

function runAnalysis() {
    // 1. Gather Selections
    const ids = ["part-select-1", "part-select-2", "part-select-3", "part-select-4"];
    const keys = ids.map(id => document.getElementById(id).value).filter(v => v !== "");

    if (keys.length < 1) {
        console.warn("[REVORA] No modules selected for analysis.");
        return;
    }

    const selectedParts = keys.map(k => partsData[k]);

    // 2. Reveal Results UI
    const tableWrap = document.getElementById("table-container");
    const chartWrap = document.getElementById("chart-container");

    if (tableWrap) tableWrap.classList.remove("is-hidden");
    if (chartWrap) chartWrap.classList.remove("is-hidden");

    // 3. Render Data
    renderTable(selectedParts);
    
    // Check if Chart.js is ready (avoid race condition if CDN is still loading)
    if (typeof Chart === 'undefined') {
        console.warn("[REVORA] Chart.js link pending. Retrying in 500ms...");
        setTimeout(() => renderChart(selectedParts), 500);
    } else {
        renderChart(selectedParts);
    }
}

function renderTable(parts) {
    const table = document.getElementById("compare-table");
    if (!table) return;

    const rows = [
        { label: "Function", key: "function" },
        { label: "Location", key: "location" },
        { label: "Motion Type", key: "motion" },
        { label: "Material", key: "material" },
        { label: "System Category", key: "system" },
        { label: "Complexity Level", key: "complexity", isNumeric: true },
        { label: "Heat Exposure", key: "heat", isNumeric: true },
        { label: "Wear Rate", key: "wear", isNumeric: true }
    ];

    const numericMap = { 1: "LOW", 2: "MEDIUM", 3: "HIGH" };

    let html = `<thead><tr><th>FEATURE</th>`;
    parts.forEach(p => html += `<th>${p.name}</th>`);
    html += `</tr></thead><tbody>`;

    rows.forEach(row => {
        html += `<tr><td>${row.label}</td>`;
        parts.forEach(p => {
            let val = p[row.key];
            if (row.isNumeric) val = `<span class="badge-${numericMap[val].toLowerCase()}">${numericMap[val]}</span>`;
            html += `<td>${val}</td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody>`;
    table.innerHTML = html;
}

function renderChart(parts) {
    const chartCanvas = document.getElementById("partChart");
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext("2d");
    if (activeChart) activeChart.destroy();

    const labels = ["Complexity", "Heat Exposure", "Wear Rate"];
    const colors = ["#38bdf8", "#ef4444", "#fbbf24", "#a855f7"];

    const datasets = parts.map((p, i) => ({
        label: p.name,
        data: [p.complexity, p.heat, p.wear],
        backgroundColor: chartType === 'radar' ? `rgba(${getRGB(colors[i])}, 0.2)` : colors[i],
        borderColor: colors[i],
        borderWidth: 2,
        pointBackgroundColor: colors[i]
    }));

    activeChart = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: "#94a3b8", font: { family: "Outfit", weight: "700" } } }
            },
            scales: chartType === 'bar' ? {
                y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b", stepSize: 1, min: 0, max: 3 } },
                x: { grid: { display: false }, ticks: { color: "#64748b" } }
            } : {
                r: { grid: { color: "rgba(255,255,255,0.1)" }, angleLines: { color: "rgba(255,255,255,0.1)" }, pointLabels: { color: "#94a3b8" }, ticks: { display: false, stepSize: 1 }, min: 0, max: 3 }
            }
        }
    });
}

function resetAnalysis() {
    const ids = ["part-select-1", "part-select-2", "part-select-3", "part-select-4"];
    ids.forEach(id => document.getElementById(id).value = "");
    
    document.getElementById("table-container").classList.add("is-hidden");
    document.getElementById("chart-container").classList.add("is-hidden");
    if (activeChart) activeChart.destroy();
}

function getRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}
