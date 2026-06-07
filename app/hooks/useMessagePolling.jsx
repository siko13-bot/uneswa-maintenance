import { useState, useEffect, useRef, useCallback } from "react";

export function useMessagePolling(requestId, initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);
  const latestIdRef = useRef(null);

  // Keep track of the latest message id we have
  useEffect(() => {
    if (messages.length > 0) {
      latestIdRef.current = messages[messages.length - 1].id;
    }
  }, [messages]);

  const fetchNewMessages = useCallback(async () => {
    if (!requestId) return;
    try {
      const token = sessionStorage.getItem("token");
      const since = latestIdRef.current ? `?after=${latestIdRef.current}` : "";
      const res = await fetch(
        `http://localhost:5000/api/requests/${requestId}/messages${since}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages((prev) => {
            // Avoid duplicates by filtering out ids we already have
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = data.filter((m) => !existingIds.has(m.id));
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [requestId]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // already running
    setIsPolling(true);
    intervalRef.current = setInterval(fetchNewMessages, 4000);
  }, [fetchNewMessages]);

  const stopPolling = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPolling(false);
  }, []);

  // Start on mount, stop on unmount
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return { messages, setMessages, isPolling };
}
