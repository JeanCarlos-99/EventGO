"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSession } from "@/lib/useSession";

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useSession();
  const [friend, setFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    const res = await fetch(`/api/messages/${friendId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      setFriend(data.friend);
      setError(null);
    } else {
      const data = await res.json();
      setError(data.error || "Nao foi possivel abrir essa conversa.");
    }
    if (!silent) setLoading(false);
  }

  // Polling simples a cada 3s para simular tempo real, sem precisar de um
  // servidor de WebSocket separado.
  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 3000);
    return () => clearInterval(id);
  }, [friendId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    await fetch(`/api/messages/${friendId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    load(true);
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <Navbar />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-4 py-4">
        {loading ? (
          <p className="text-sm text-muted">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-muted">{error}</p>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ink/5 text-sm font-semibold">
                {friend?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
                ) : (
                  friend?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <Link href={friend?.username ? `/u/${friend.username}` : "#"} className="text-sm font-semibold hover:text-coral">
                  {friend?.name}
                </Link>
                <p className="text-xs text-muted">@{friend?.username}</p>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto py-4">
              {messages.length === 0 && (
                <p className="mt-8 text-center text-sm text-muted">
                  Nenhuma mensagem ainda. Diga oi! 👋
                </p>
              )}
              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        mine ? "bg-pin text-white" : "bg-surface border border-line text-ink"
                      }`}
                    >
                      {m.content}
                      <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                        {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="flex gap-2 border-t border-line pt-3">
              <input
                value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 rounded-full border border-line px-4 py-2 text-sm outline-none focus:border-coral"
              />
              <button className="rounded-full bg-pin px-4 py-2 text-sm font-semibold text-white">Enviar</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
