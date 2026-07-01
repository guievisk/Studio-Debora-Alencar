"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatIA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

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
      setTimeout(() => inputRef.current?.focus(), 100);
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
        <Image
          src="/llogo.png"
          alt="Luna"
          width={42}
          height={42}
          className={styles.lunaAvatar}
        />
        <div className={styles.chatHeaderText}>
          <span className={styles.chatHeaderName}>Luna IA</span>
          <span className={styles.chatHeaderSub}>Sua assistente de negócios</span>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.chatEmpty}>
            <p>Olá Débora! Sou a Luna, sua assistente.</p>
            <span>
              Me pergunte sobre seu faturamento, serviços mais vendidos, ou peça
              dicas para crescer.
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "assistant" && (
              <div className={styles.lunaLabel}>Luna</div>
            )}
            <div
              className={`${styles.message} ${
                msg.role === "user" ? styles.user : styles.luna
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className={styles.typing}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Pergunte algo sobre seu negócio..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}