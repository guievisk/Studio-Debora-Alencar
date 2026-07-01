"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AgendarPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou a Luna, assistente da Débora Alencar Beauty ✨ Posso te ajudar a agendar um horário. Qual serviço você gostaria?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function handleSend() {
    const texto = input.trim();
    if (!texto || loading) return;

    const novasMensagens: Message[] = [
      ...messages,
      { role: "user", content: texto },
    ];
    setMessages(novasMensagens);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agendar/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: novasMensagens }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages([
          ...novasMensagens,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages([
          ...novasMensagens,
          {
            role: "assistant",
            content:
              "Desculpe, tive um problema técnico. Tente novamente ou entre em contato pelo WhatsApp.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...novasMensagens,
        {
          role: "assistant",
          content: "Erro ao conectar. Verifique sua internet ou tente novamente.",
        },
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
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.sectionNumber}>— 01 —</div>
        <span className={styles.sectionLabel}>Agendamento</span>
        <h1 className={styles.title}>
          Agende seu <em>horário</em>
        </h1>
        <p className={styles.subtitle}>
          Converse com a Luna e encontre o melhor horário para você.
        </p>
      </div>

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
            <span className={styles.chatHeaderName}>Luna</span>
            <span className={styles.chatHeaderSub}>Assistente virtual</span>
          </div>
        </div>

        <div className={styles.messages}>
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
            placeholder="Digite sua mensagem..."
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
    </section>
  );
}