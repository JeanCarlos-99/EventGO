"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/users/${username}`);
    const result = await res.json();
    setData(res.ok ? result : null);
    setLoading(false);
  }

  useEffect(() => { load(); }, [username]);

  async function addFriend() {
    setSending(true);
    setMessage(null);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: username }),
    });
    const result = await res.json();
    setSending(false);
    if (!res.ok) setMessage(result.error || "Nao foi possivel enviar a solicitacao.");
    else { setMessage("Solicitacao de amizade enviada!"); load(); }
  }

  if (loading) return <div className="min-h-screen bg-paper"><Navbar /></div>;
  if (!data) return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <p className="p-8 text-sm text-muted">Usuario nao encontrado.</p>
    </div>
  );

  const { user, restricted, friendshipStatus, isSelf } = data;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-coral to-amber text-xl font-bold text-white">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted">@{user.username}</p>
            </div>
          </div>

          {restricted ? (
            <p className="mt-6 rounded-xl bg-paper p-4 text-sm text-muted">
              🔒 Este perfil e' privado. Adicione {user.name} como amigo para ver mais detalhes.
            </p>
          ) : (
            <>
              {user.bio && <p className="mt-4 text-sm text-ink/80">{user.bio}</p>}
              {(user.city || user.state) && (
                <p className="mt-2 text-sm text-muted">📍 {[user.city, user.state].filter(Boolean).join(", ")}</p>
              )}
              {user.interests && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.interests.split(",").map((i: string) => (
                    <span key={i} className="rounded-full bg-ink/5 px-3 py-1 text-xs">{i}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-4 text-sm text-muted">
                <span><b className="text-ink">{user.points}</b> pontos</span>
                <span><b className="text-ink">{user.level}</b> nivel</span>
              </div>
            </>
          )}

          {!isSelf && (
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              {friendshipStatus === "ACCEPTED" ? (
                <button onClick={() => router.push(`/chat/${user.id}`)}
                  className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white">
                  💬 Conversar
                </button>
              ) : friendshipStatus === "PENDING" ? (
                <span className="rounded-full bg-ink/5 px-4 py-2 text-sm text-muted">Solicitacao pendente</span>
              ) : (
                <button onClick={addFriend} disabled={sending}
                  className="rounded-full bg-pin px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {sending ? "Enviando..." : "Adicionar amigo"}
                </button>
              )}
            </div>
          )}
          {message && <p className="mt-2 text-xs text-muted">{message}</p>}
        </div>
      </div>
    </div>
  );
}
