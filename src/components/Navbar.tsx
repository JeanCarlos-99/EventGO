"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { useNotifications } from "@/lib/useNotifications";

export default function Navbar() {
  const { user, loading, refresh } = useSession();
  const router = useRouter();
  const notifications = useNotifications(!!user);
  const totalAlerts = notifications.pendingFriendRequests + notifications.unreadMessages;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="pin-marker" style={{ width: 26, height: 26 }}>
            <span style={{ fontSize: 11 }}>📍</span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">EventGo</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <Link href="/" className="hover:text-ink">Explorar</Link>
          <Link href="/create-event" className="hover:text-ink">Criar evento</Link>
          <Link href="/friends" className="hover:text-ink">Amigos</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user && (
            <div className="hidden items-center gap-1 rounded-full bg-gold/10 px-3 py-1 font-mono text-xs font-medium text-amber-700 sm:flex">
              ✦ {user.points} pts · Nv. {user.level}
            </div>
          )}

          {!loading && user && (
            <Link href="/friends" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5" title="Notificacoes">
              <span className="text-lg">🔔</span>
              {totalAlerts > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              )}
            </Link>
          )}

          {!loading && user ? (
            <>
              <Link
                href="/profile"
                className="h-9 w-9 overflow-hidden rounded-full bg-ink/5 flex items-center justify-center text-sm font-semibold"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:bg-ink/5"
              >
                Sair
              </button>
            </>
          ) : !loading ? (
            <Link
              href="/login"
              className="rounded-full bg-pin px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
            >
              Entrar
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
