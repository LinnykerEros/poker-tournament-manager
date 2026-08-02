import { useRef, useCallback } from "react";

// Alertas sonoros do timer, compartilhados entre a aba do organizador e a
// tela da TV.
export function useTimerSounds() {
  const audioCtx = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playBeep = useCallback(
    (freq = 880, dur = 0.15, vol = 0.3) => {
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "square";
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}
    },
    [getAudioCtx]
  );

  const playLevelChangeAlert = useCallback(() => {
    const notes = [660, 880, 1100];
    notes.forEach((freq, i) => setTimeout(() => playBeep(freq, 0.25, 0.6), i * 300));
    setTimeout(
      () => notes.forEach((freq, i) => setTimeout(() => playBeep(freq, 0.25, 0.6), i * 300)),
      1200
    );
  }, [playBeep]);

  // Navegador só libera áudio após um gesto do usuário. Chame isto no
  // primeiro clique/tecla da página para destravar o contexto.
  const unlockAudio = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    } catch (e) {}
  }, [getAudioCtx]);

  return { getAudioCtx, playBeep, playLevelChangeAlert, unlockAudio };
}
