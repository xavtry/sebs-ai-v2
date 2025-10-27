import React, { useState, useRef, useEffect } from "react";

/**
 * Chat UI:
 * - uses /api/chat (backend) to send messages
 * - secret codes:
 *    2393439657490 -> Developer
 *    1928473627182 -> Creative
 * - Safe modes only (no explicit / sexual modes)
 */

const SECRET_DEV = "2393439657490";
const SECRET_CREATIVE = "1928473627182";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey — I'm Seb's AI. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("Friendly");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function pushMessage(sender, text) {
    setMessages((m) => [...m, { sender, text }]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    // Secret-code toggles (local)
    if (text === SECRET_DEV) {
      setMode("Developer");
      setInput("");
      pushMessage("ai", "Developer Mode activated. I will be more technical.");
      return;
    }
    if (text === SECRET_CREATIVE) {
      setMode("Creative");
      setInput("");
      pushMessage("ai", "Creative Mode activated. Expect playful and imaginative answers.");
      return;
    }

    // Normal message flow
    pushMessage("user", text);
    setInput("");
    setLoading(true);
    pushMessage("ai", "Thinking...");

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode }),
      });
      const data = await resp.json();
      // replace last placeholder AI message
      setMessages((m) => {
        const copy = [...m];
        // find last ai 'Thinking...' index from the end
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].sender === "ai" && copy[i].text === "Thinking...") {
            copy[i] = { sender: "ai", text: data.reply };
            break;
          }
        }
        return copy;
      });
    } catch (e) {
      // replace placeholder with error
      setMessages((m) => {
        const copy = [...m];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].sender === "ai" && copy[i].text === "Thinking...") {
            copy[i] = { sender: "ai", text: "Error: couldn't reach the server." };
            break;
          }
        }
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <img src="/logo.png" className="logo" alt="Seb's AI" />
        <div className="title">Seb's AI</div>
        <div className="mode-badge">Mode: {mode}</div>
      </div>

      <div className="chat-area">
        <div className="messages" role="log">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender === "user" ? "user" : "ai"}`}>
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="controls">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message... (secret codes change mode)"
            disabled={loading}
            autoFocus
          />
          <button className="btn" onClick={sendMessage} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
