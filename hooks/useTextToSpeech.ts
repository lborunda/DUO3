import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchElevenLabsAudio } from '../services/elevenLabsService';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reuse one <audio> element for the session
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Ensure we have a single, prepared <audio> element
  const ensureAudioEl = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const el = document.createElement('audio');
      el.preload = 'auto';
      // @ts-ignore
      el.playsInline = true;
      el.setAttribute('playsinline', ''); // WebKit/iOS
      el.style.display = 'none';
      document.body.appendChild(el);
      audioRef.current = el;
    }
    return audioRef.current!;
  }, []);

  const cleanupAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      try { el.pause(); } catch {}
      el.removeAttribute('src');
      el.load();
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, _lang?: string, rate: number = 1) => {
    cleanupAudio();
    if (!text.trim()) return;

    setIsSpeaking(true);
    try {
      // 1) Fetch TTS audio
      const audioBlob = await fetchElevenLabsAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // 2) Prepare/reuse <audio>
      const el = ensureAudioEl();
      el.playbackRate = Math.max(0.5, Math.min(2.5, rate));
      el.src = audioUrl;

      // 3) Hook up end/error
      const handleEnd = () => cleanupAudio();
      const handleError = (e: Event) => {
        console.error('Audio playback error:', e);
        cleanupAudio();
      };
      el.onended = handleEnd;
      el.onerror = handleError;

      // 4) Play (may throw NotAllowedError on iOS if not unlocked)
      await el.play();
    } catch (err: any) {
      // NotAllowedError: iOS blocked autoplay (user hasn’t tapped unlock yet)
      if (err && err.name === 'NotAllowedError') {
        console.warn('Audio blocked: tap "Enable sound" first.');
      } else {
        console.error('Failed to speak with ElevenLabs:', err);
      }
      cleanupAudio();
      throw err;
    }
  }, [cleanupAudio, ensureAudioEl]);

  const cancel = useCallback(() => {
    cleanupAudio();
  }, [cleanupAudio]);

  useEffect(() => {
    return () => {
      // Unmount cleanup
      cleanupAudio();
      if (audioRef.current) {
        try { document.body.removeChild(audioRef.current); } catch {}
        audioRef.current = null;
      }
    };
  }, [cleanupAudio]);

  return { speak, cancel, isSpeaking };
};
