"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./page.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ClienteInfo = {
  nome: string;
  email: string;
  whatsapp: string | null;
  foto_url: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type User = any;

export default function AgendarPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>(null);
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await carregarCliente(user);
      }
      setCheckingAuth(false);
    }
    checkUser();
  }, []);

  async function carregarCliente(user: User) {
    const res = await fetch("/api/agendar/cliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        nome: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        foto_url: user.user_metadata?.avatar_url || null,
      }),
    });

    const data = await res.json();
    if (data.cliente) {
      setCliente(data.cliente);

      const convRes = await fetch(`/api/agendar/conversa?user_id=${user.id}`);
      const convData = await convRes.json();

      if (convData.messages && convData.messages.length > 0) {
        setMessages(convData.messages);
      } else {
        const saudacao = data.cliente.whatsapp
          ? `Olá ${data.cliente.nome.split(" ")[0]}! Bem-vinda de volta ✨ Qual serviço você gostaria de agendar?`
          : `Olá ${data.cliente.nome.split(" ")[0]}! Bem-vinda ao agendamento da Débora Alencar Beauty ✨ Qual serviço você gostaria de agendar?`;

        setMessages([{ role: "assistant", content: saudacao }]);
      }
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/agendar`,
      },
    });
    if (error) console.error("Erro login:", error);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    if (!user || messages.length <= 1) return;
    const timeoutId = setTimeout(() => {
      fetch("/api/agendar/conversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          messages: messages,
        }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, user]);

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
        body: JSON.stringify({
          messages: novasMensagens,
          cliente: cliente,
        }),
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
            content: "Desculpe, tive um problema técnico. Tente novamente ou entre em contato pelo WhatsApp.",
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

  function getIniciais(nome: string) {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  if (checkingAuth) {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.sectionNumber}>— 01 —</div>
        <span className={styles.sectionLabel}>Agendamento</span>
        <h1 className={styles.title}>
          Agende seu <em>horário</em>
        </h1>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.chatHeaderText}>
            <span className={styles.chatHeaderName}>Luna</span>
            <span className={styles.chatHeaderSub}>Carregando...</span>
          </div>
        </div>
        <div className={styles.messages}>
          <div className={styles.typing}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    </section>
  );
}

  if (!user) {
    return (
      <section className={styles.page}>
        <div className={styles.header}>
          <div className={styles.sectionNumber}>— 01 —</div>
          <span className={styles.sectionLabel}>Agendamento</span>
          <h1 className={styles.title}>
            Agende seu <em>horário</em>
          </h1>
        </div>

        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginIcon}>✨</div>
            <h2 className={styles.loginTitle}>Faça login para agendar</h2>
            <p className={styles.loginDesc}>
              Entre com sua conta Google para agendar seu horário com a Luna.
            </p>
            <button onClick={handleGoogleLogin} className={styles.googleBtn}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Entrar com Google
            </button>
            <p className={styles.loginFooter}>Seus dados são usados apenas para o agendamento.</p>
          </div>
        </div>
      </section>
    );
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
            <div
              key={i}
              className={`${styles.messageRow} ${
                msg.role === "user" ? styles.messageRowUser : styles.messageRowLuna
              }`}
            >
              {msg.role === "assistant" ? (
                <Image
                  src="/llogo.png"
                  alt="Luna"
                  width={36}
                  height={36}
                  className={styles.messageAvatar}
                />
              ) : cliente?.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cliente.foto_url}
                  alt=""
                  className={styles.messageAvatar}
                />
              ) : (
                <div className={styles.messageAvatarIniciais}>
                  {getIniciais(cliente?.nome || "?")}
                </div>
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
            <div className={`${styles.messageRow} ${styles.messageRowLuna}`}>
              <Image
                src="/llogo.png"
                alt="Luna"
                width={36}
                height={36}
                className={styles.messageAvatar}
              />
              <div className={styles.typing}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
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