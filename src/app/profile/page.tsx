"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSession } from "@/lib/useSession";

const LEVEL_NEXT = [0, 50, 150, 350, 700, 1200, 2000, 3200, 5000];

export default function ProfilePage() {
  const { user, loading, refresh } = useSession();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", bio: "", city: "", state: "", isPublic: true });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name, username: user.username || "", bio: user.bio || "",
        city: user.city || "", state: user.state || "", isPublic: user.isPublic ?? true,
      });
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Escolha uma imagem de ate 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatarUrl: avatarPreview || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Nao foi possivel salvar. Verifique os campos.");
      return;
    }
    await refresh();
    setEditing(false);
  }

  if (loading) return <div className="min-h-screen bg-paper"><Navbar /></div>;
  if (!user) return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <p className="p-8 text-sm text-muted">Faca login para ver seu perfil.</p>
    </div>
  );

  const nextThreshold = LEVEL_NEXT[user.level] ?? LEVEL_NEXT[LEVEL_NEXT.length - 1];
  const prevThreshold = LEVEL_NEXT[user.level - 1] ?? 0;
  const progress = Math.min(100, Math.round(((user.points - prevThreshold) / (nextThreshold - prevThreshold)) * 100));

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-coral to-amber text-xl font-bold text-white flex items-center justify-center">
                  {(editing ? avatarPreview : user.avatarUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(editing ? avatarPreview : user.avatarUrl) as string} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {editing && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white shadow"
                    title="Trocar foto"
                  >
                    📷
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">{user.name}</h1>
                <p className="text-sm text-muted">
                  {user.username ? `@${user.username}` : ""}
                  {user.city ? ` · ${user.city}${user.state ? ", " + user.state : ""}` : ""}
                </p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:bg-ink/5"
              >
                Editar perfil
              </button>
            )}
          </div>

          {editing ? (
            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome" className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Nome de usuario (ex: joao.silva)" className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Biografia" rows={3} maxLength={280}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Cidade" className="rounded-lg border border-line px-3 py-2 text-sm" />
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Estado" className="rounded-lg border border-line px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                Perfil publico (outros usuarios podem ver seus dados)
              </label>

              {error && <p className="text-xs text-rose-600">{error}</p>}
              <div className="mt-1 flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="rounded-full bg-pin px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={() => { setEditing(false); setError(null); }}
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            user.bio && <p className="mt-4 text-sm text-ink/80">{user.bio}</p>
          )}

          <div className="mt-6 rounded-xl bg-paper p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Nivel {user.level}</span>
              <span className="font-mono text-xs text-muted">{user.points} pts</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full bg-pin" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Faltam {Math.max(0, nextThreshold - user.points)} pontos para o proximo nivel
            </p>
          </div>

          {user.interests && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Interesses</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.split(",").map((i) => (
                  <span key={i} className="rounded-full bg-ink/5 px-3 py-1 text-xs">{i}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-paper p-3">
              <p className="font-display text-lg font-bold">{user.points}</p>
              <p className="text-[11px] text-muted">pontos</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="font-display text-lg font-bold">{user.level}</p>
              <p className="text-[11px] text-muted">nivel</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="font-display text-lg font-bold">🏅</p>
              <p className="text-[11px] text-muted">medalhas (em breve)</p>
            </div>
          </div>

          {user.username && (
            <p className="mt-6 text-center text-xs text-muted">
              Seu perfil publico: <Link href={`/u/${user.username}`} className="font-medium text-coral">eventgo.app/u/{user.username}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
