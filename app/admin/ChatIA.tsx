"use client";

import { useState } from "react";
import styles from "./chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatIA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply || "Erro ao processar resposta",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderDot} />
        <div>
          <div className={styles.chatHeaderTitle}>Luna IA</div>
          <div className={styles.chatHeaderSub}>Sua assistente de negócios</div>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={styles.chatEmpty}>
            <p>Olá Débora! Sou a Luna, sua assistente.</p>
            <span>Me pergunte sobre seu faturamento, serviços mais vendidos, ou peça dicas para crescer.</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user" ? styles.messageUser : styles.messageAI
            }
          >
            <p>{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className={styles.messageAI}>
            <p className={styles.typing}>Luna está pensando...</p>
          </div>
        )}
      </div>

      <div className={styles.chatInputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte algo sobre seu negócio..."
          className={styles.chatInput}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={styles.chatSendBtn}
        >
          {loading ? "..." : "→"}
        </button>
      </div>
    </div>
  );
}