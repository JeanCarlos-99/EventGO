"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function FriendsPage() {
  const [data, setData] = useState<any>({ friends: [], pendingReceived: [], pendingSent: [] });
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/friends");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const result = await res.json();
    if (!res.ok) setMessage(result.error || "Nao foi possivel enviar a solicitacao.");
    else { setMessage("Solicitacao enviada!"); setIdentifier(""); load(); }
  }

  async function respond(id: string, action: "accept" | "decline" | "block") {
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-xl font-bold">Amigos</h1>
        <p className="mt-1 text-sm text-muted">Adicione pelo nome de usuário, telefone ou e-mail.</p>

        <form onSubmit={sendRequest} className="mt-4 flex gap-2">
          <input
            required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
            placeholder="@usuario, telefone ou e-mail" className="flex-1 rounded-full border border-line px-4 py-2 text-sm outline-none focus:border-coral"
          />
          <button className="rounded-full bg-pin px-4 py-2 text-sm font-semibold text-white">Adicionar</button>
        </form>
        {message && <p className="mt-2 text-xs text-muted">{message}</p>}

        {!loading && data.pendingReceived?.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">🔔 Solicitações de amizade pendentes</p>
            <div className="flex flex-col gap-2">
              {data.pendingReceived.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl border border-coral/30 bg-coral/5 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-ink/5 text-sm font-semibold">
                      {f.requester.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.requester.avatarUrl} alt={f.requester.name} className="h-full w-full object-cover" />
                      ) : (
                        f.requester.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm">{f.requester.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respond(f.id, "accept")} className="rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">Aceitar</button>
                    <button onClick={() => respond(f.id, "decline")} className="rounded-full border border-line px-3 py-1 text-xs">Recusar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Seus amigos ({data.friends?.length ?? 0})</p>
          <div className="flex flex-col gap-2">
            {data.friends?.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
                <Link href={f.username ? `/u/${f.username}` : "#"} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-ink/5 text-sm font-semibold">
                    {f.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.avatarUrl} alt={f.name} className="h-full w-full object-cover" />
                    ) : (
                      f.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted">{f.city || ""}</p>
                  </div>
                </Link>
                <button
                  onClick={() => router.push(`/chat/${f.id}`)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:bg-ink/5"
                >
                  💬 Conversar
                </button>
              </div>
            ))}
            {!loading && data.friends?.length === 0 && (
              <p className="text-sm text-muted">Voce ainda nao tem amigos por aqui.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
