import { useEffect, useRef, useCallback } from "react";

export function useBroadcastSender(tournamentId) {
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(`poker-timer-${tournamentId}`);
    return () => channelRef.current?.close();
  }, [tournamentId]);

  const broadcast = useCallback((data) => {
    channelRef.current?.postMessage(data);
  }, []);

  return broadcast;
}

export function useBroadcastReceiver(tournamentId, onMessage) {
  useEffect(() => {
    const channel = new BroadcastChannel(`poker-timer-${tournamentId}`);
    channel.onmessage = (e) => onMessage(e.data);
    return () => channel.close();
  }, [tournamentId, onMessage]);
}
