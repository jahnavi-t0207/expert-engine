document.addEventListener("DOMContentLoaded", () => {
    const termText = document.getElementById("terminal-text");
    const cursor = document.getElementById("terminal-cursor");
    if (!termText) return;

    const lines = [
        "> BOOT SEQUENCE INITIATED...",
        "> CONNECTING TO REVORA MAINFRAME...",
        "> STATUS: 200 OK.",
        "> SYNCING 3D MESH DATA [||||||||||] 100%",
        "> AUTHENTICATING TEAM CODE JAMMERS...",
        "> ACCESS GRANTED.",
        "> WAITING FOR USER INPUT"
    ];

    let currentLine = 0;
    let currentChar = 0;
    let charSpeed = 25; // ms per keystroke
    let lineDelay = 600; // ms per line break

    function typeLine() {
        if (currentLine < lines.length) {
            let row = lines[currentLine];
            
            // Add a break for new lines
            if (currentChar === 0 && currentLine > 0) {
               termText.innerHTML += "<br>";
            }

            if (currentChar < row.length) {
                // Simulate fast typing
                termText.innerHTML += row.charAt(currentChar);
                currentChar++;
                
                // Add a random tiny glitch delay to feel like a real terminal
                let flutter = Math.random() > 0.9 ? 150 : charSpeed;
                setTimeout(typeLine, flutter);
            } else {
                // Line finished
                currentChar = 0;
                currentLine++;
                
                // If the line says 'ACCESS GRANTED', make it flash
                if (row.includes("ACCESS GRANTED")) {
                    termText.innerHTML = termText.innerHTML.replace("ACCESS GRANTED.", "<span style='color: #10b981; font-weight: bold;'>ACCESS GRANTED.</span>");
                }
                
                setTimeout(typeLine, lineDelay);
            }
        } else {
            // Blink cursor forever at the end
            cursor.classList.add("infinite-blink");
        }
    }

    // Start the boot sequence
    setTimeout(typeLine, 800);
});
