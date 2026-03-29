// Knowledge is now handled by the backend!

const suggestions = [
  "What is a Piston?",
  "How does a Turbo work?",
  "Difference between HP and Torque?",
  "What is VVT?",
  "What is a DOHC engine?",
  "Why is the I6 balanced?",
  "What does a Wastegate do?"
];

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const messages = document.getElementById("chat-messages");
  const suggestText = document.getElementById("suggest-text");

  // Rotating suggestion
  let suggIndex = 0;
  setInterval(() => {
    suggIndex = (suggIndex + 1) % suggestions.length;
    if (suggestText) suggestText.innerText = suggestions[suggIndex];
  }, 4000);

  // Send Event
  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = "";
    
    // Simulate thinking
    showTyping();
    setTimeout(() => {
      removeTyping();
      processInput(text);
    }, 800);
  };

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Suggest Tags Event
  const updateSuggestClick = () => {
    document.querySelectorAll(".suggest-tag").forEach(tag => {
      tag.onclick = null; // Clean up
      tag.onclick = () => {
        input.value = tag.innerText;
        sendMessage();
      };
    });
  };
  updateSuggestClick();

  function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = `message ${type}-msg`;
    // Bold bolding keywords
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--blue)">$1</strong>');
    messages.appendChild(msg);
    
    // Smooth scroll to bottom
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.id = "typing-dots";
    typing.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("typing-dots");
    if (t) t.remove();
  }

  async function processInput(text) {
    try {
      const response = await fetch('http://localhost:3000/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await response.json();
      
      let finalHtml = data.text;

      if (data.link) {
        finalHtml += `<br><a href="${data.link}" class="link-chip" style="border-color:var(--red); color:var(--red); background:rgba(239,68,68,0.1)">🚀 VIEW IN 3D LIBRARY</a>`;
      }

      addMessage(finalHtml, 'bot');
    } catch (err) {
      console.error("Assistant API error:", err);
      addMessage("System error: Unable to reach Revora Mainframe.", 'bot');
    }
  }
});
