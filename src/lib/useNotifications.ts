"use client";
import { useEffect, useState } from "react";

// Faz polling leve das contagens de notificacao (pedidos de amizade pendentes
// e mensagens nao lidas) para alimentar o sininho no topo.
export function useNotifications(enabled: boolean, intervalMs = 8000) {
  const [counts, setCounts] = useState({ pendingFriendRequests: 0, unreadMessages: 0 });

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    async function poll() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped) setCounts(data);
      } catch {}
    }
    poll();
    const id = setInterval(poll, intervalMs);
    return () => { stopped = true; clearInterval(id); };
  }, [enabled, intervalMs]);

  return counts;
}
