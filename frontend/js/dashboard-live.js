document.addEventListener("DOMContentLoaded", () => {
    // Connect to the backend
    const socket = io("http://localhost:3000");

    // Get the bento-stat cards
    const statCards = document.querySelectorAll(".dash-stat-card");
    
    // We expect 4 cards as per index.html layout:
    // 0: Max Power
    // 1: System Efficiency
    // 2: Engine Schematics (Static for now)
    // 3: Server RPM Cycle

    socket.on("connect", () => {
        console.log("[Socket] Connected to backend telemetry.");
    });

    socket.on("telemetry", (data) => {
        // Update RPM Card (Index 3)
        if (statCards[3]) {
            const rpmValue = statCards[3].querySelector(".dash-stat-value");
            rpmValue.innerHTML = `${data.rpm.toLocaleString()} <span style="font-size: 14px; color: #64748b; font-weight: 500;">/ REAL-TIME</span>`;
            // Add a subtle "ping" effect
            statCards[3].style.borderColor = "var(--blue)";
            setTimeout(() => statCards[3].style.borderColor = "transparent", 200);
        }

        // Update Efficiency Card (Index 1)
        if (statCards[1]) {
            const effValue = statCards[1].querySelector(".dash-stat-value");
            effValue.innerHTML = `${data.efficiency}% <span style="font-size: 14px; color: #64748b; font-weight: 500;">/ OPTIMAL</span>`;
        }

        // Update Max Power (Index 0)
        if (statCards[0]) {
            const pwrValue = statCards[0].querySelector(".dash-stat-value");
            pwrValue.innerHTML = `${data.power} HP <span style="font-size: 14px; color: #64748b; font-weight: 500;">/ LOADED</span>`;
        }
    });

    socket.on("disconnect", () => {
        console.warn("[Socket] Disconnected from backend.");
    });
});
