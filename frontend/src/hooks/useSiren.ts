import { useState, useEffect, useCallback } from 'react';
import { audioService } from '@/services/audio/audioService';

export function useSiren() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Siren is idle (standby).');

  const updateState = useCallback(() => {
    const status = audioService.getSirenStatus();
    setIsPlaying(status.isPlaying);
    setIsMuted(status.isMuted);
    setAudioBlocked(status.audioBlocked);
  }, []);

  const startSiren = useCallback(async () => {
    const res = await audioService.startSiren();
    if (res.success) {
      setIsPlaying(true);
      setStatusMessage('🚨 SIREN ACTIVE: Loud dual-tone alarm sounding locally. Tap Stop Siren to silence.');
    } else {
      setIsPlaying(false);
      setAudioBlocked(true);
      setStatusMessage(`Unable to play alarm: ${res.error}. Device or browser audio restrictions prevented playback.`);
    }
  }, []);

  const stopSiren = useCallback(() => {
    audioService.stopSiren();
    setIsPlaying(false);
    setStatusMessage('Siren stopped and silenced.');
  }, []);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    audioService.setMute(nextMute);
    setIsMuted(nextMute);
    setStatusMessage(nextMute ? 'Siren audio muted (alarm oscillator running silently).' : 'Siren unmuted.');
  }, [isMuted]);

  useEffect(() => {
    updateState();
    return () => {
      // Ensure siren is stopped when unmounting
      audioService.stopSiren();
    };
  }, [updateState]);

  return {
    isPlaying,
    isMuted,
    audioBlocked,
    statusMessage,
    startSiren,
    stopSiren,
    toggleMute
  };
}
