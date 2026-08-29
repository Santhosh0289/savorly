import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import api from "../api/axios";

const STARTER = {
  role: "assistant",
  content: "Hi! I'm Savorly's nutrition assistant 🥗 Ask me about calories, protein, portion sizes, or what to order for your goals.",
};

function formatAssistantMessage(content) {
  const normalized = content
    .replace(/\\\*\s*/g, "\n- ")
    .replace(/\*\*/g, "")
    .replace(/\\([_`])/g, "$1")
    .trim();
  const lines = normalized.split(/\n+/).filter(Boolean);

  return lines.map((line, index) => {
    const bullet = line.match(/^\s*(?:[-*•])\s+(.+)$/);
    return bullet ? (
      <div className="ai-message-bullet" key={index}>{bullet[1]}</div>
    ) : (
      <p key={index}>{line}</p>
    );
  });
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([STARTER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/assistant/chat", {
        messages: nextMessages.filter((m) => m !== STARTER || nextMessages.indexOf(m) !== 0).map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble responding right now. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen((o) => !o)} aria-label="Open nutrition assistant">
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <MessageCircle size={18} />
            <div>
              <div className="ai-panel-title">Nutrition Assistant</div>
              <div className="ai-panel-subtitle">Ask about calories, protein & more</div>
            </div>
          </div>

          <div className="ai-panel-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-bubble ${m.role === "user" ? "ai-bubble-user" : "ai-bubble-assistant"}`}>
                {m.role === "assistant" ? formatAssistantMessage(m.content) : m.content}
              </div>
            ))}
            {loading && <div className="ai-bubble ai-bubble-assistant ai-typing"><span></span><span></span><span></span></div>}
          </div>

          <div className="ai-panel-input">
            <textarea
              rows="1"
              placeholder="e.g. How much protein is in the pepper chicken?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button onClick={send} disabled={loading || !input.trim()}><Send size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
}
