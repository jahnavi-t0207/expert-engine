document.addEventListener("DOMContentLoaded", () => {
  let knowledgeBase = null;
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const suggestions = document.getElementById("suggestions");

  /* ---------- FETCH DATA ---------- */
  async function loadKnowledge() {
    try {
      const response = await fetch("backend/data/knowledge.json");
      knowledgeBase = await response.json();
    } catch (err) {
      console.error("Assistant data failed:", err);
    }
  }
  loadKnowledge();

  /* ---------- CHAT FUNCTIONS ---------- */
  function addMessage(text, isUser = false) {
    const msg = document.createElement("div");
    msg.className = `message ${isUser ? "user-msg" : "bot-msg"}`;
    
    // Simple Markdown-like parsing for bold text
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    msg.innerHTML = formattedText;
    
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animation
    msg.style.opacity = "0";
    msg.style.transform = isUser ? "translateX(20px)" : "translateX(-20px)";
    requestAnimationFrame(() => {
      msg.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      msg.style.opacity = "1";
      msg.style.transform = "translateX(0)";
    });
  }

  function handleQuery(query) {
    const q = query.toLowerCase().trim();
    if (!q) return;

    addMessage(query, true);
    chatInput.value = "";

    // Typing Simulation
    setTimeout(() => {
      let response = "I'm sorry, my current diagnostic logs don't contain specific data on that. Try asking about **Pistons**, **VVT**, or **Turbochargers**.";
      let link = null;

      if (knowledgeBase) {
        // Find best match
        for (const key in knowledgeBase) {
          if (q.includes(key.toLowerCase())) {
            response = knowledgeBase[key].answer;
            link = knowledgeBase[key].link;
            break;
          }
        }
      }

      addMessage(response, false);
      if (link) {
        setTimeout(() => {
          const chip = document.createElement("a");
          chip.href = link;
          chip.className = "link-chip";
          chip.innerHTML = `🔗 Read detailed documentation on ${link.replace(".html", "")}`;
          chatMessages.appendChild(chip);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
      }
    }, 800);
  }

  /* ---------- LISTENERS ---------- */
  sendBtn.addEventListener("click", () => handleQuery(chatInput.value));
  
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleQuery(chatInput.value);
  });

  suggestions.addEventListener("click", (e) => {
    if (e.target.classList.contains("suggest-tag")) {
      handleQuery(e.target.textContent);
    }
  });
});
