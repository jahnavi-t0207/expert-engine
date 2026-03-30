document.addEventListener("DOMContentLoaded", () => {
    const termText = document.getElementById("terminal-text");
    const cursor = document.getElementById("terminal-cursor");
    if (!termText) return;

    let sequences = [];

    async function fetchTerminalSequences() {
        try {
            const response = await fetch('http://localhost:3000/api/terminal');
            const data = await response.json();
            sequences = data.boot.map(s => s.lines);
            typeLine(); // Start typing after data is loaded
        } catch (err) {
            console.error("Failed to fetch terminal sequences:", err);
            termText.innerHTML = "> CONNECTION ERROR: REVORA OFFLINE.";
        }
    }

    let charSpeed = 22;
    let lineDelay = 500;
    let seqIndex = 0;
    let currentLine = 0;
    let currentChar = 0;

    function clearTerminal() {
        termText.innerHTML = "";
    }

    function typeLine() {
        const lines = sequences[seqIndex];

        if (currentLine < lines.length) {
            let row = lines[currentLine];

            if (currentChar === 0 && currentLine > 0) {
                termText.innerHTML += "<br>";
            }

            if (currentChar < row.length) {
                let ch = row.charAt(currentChar);
                // Green highlight for special phrases
                termText.innerHTML += ch;
                currentChar++;
                let flutter = Math.random() > 0.92 ? 120 : charSpeed;
                setTimeout(typeLine, flutter);
            } else {
                currentChar = 0;
                currentLine++;

                // Color certain lines differently
                if (row.includes("ACCESS GRANTED") || row.includes("✓") || row.includes("OPERATIONAL")) {
                    const last = termText.innerHTML.lastIndexOf(row.replace(/</g, "&lt;"));
                    termText.innerHTML = termText.innerHTML.replace(
                        row, `<span style='color:#10b981;font-weight:bold;'>${row}</span>`
                    );
                }
                if (row.includes("FUN FACT")) {
                    termText.innerHTML = termText.innerHTML.replace(
                        row, `<span style='color:#fcd34d;'>${row}</span>`
                    );
                }

                setTimeout(typeLine, lineDelay);
            }
        } else {
            // Sequence done — wait 3s, then cycle to next
            cursor.classList.add("infinite-blink");
            setTimeout(() => {
                cursor.classList.remove("infinite-blink");
                seqIndex = (seqIndex + 1) % sequences.length;
                currentLine = 0;
                currentChar = 0;
                clearTerminal();
                setTimeout(typeLine, 400);
            }, 3000);
        }
    }

    fetchTerminalSequences();
});
