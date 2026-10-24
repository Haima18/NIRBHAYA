import { useState, useEffect, useCallback } from 'react';
import { CheckInSession } from '@/types';
import { storageService } from '@/services/storage/storageService';

export function useCheckInTimer() {
  const [session, setSession] = useState<CheckInSession | null>(() => storageService.getCheckIn());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Recalculate remaining seconds
  const tick = useCallback(() => {
    if (!session) {
      setRemainingSeconds(0);
      setIsExpired(false);
      return;
    }

    // A persisted expired session must remain visible after a reload. Do not
    // reset the expired flag just because the timer is no longer ticking.
    if (session.status === 'expired') {
      setRemainingSeconds(0);
      setIsExpired(true);
      return;
    }

    if (session.status !== 'active') {
      setRemainingSeconds(0);
      setIsExpired(false);
      return;
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((session.targetTime - now) / 1000));
    setRemainingSeconds(remaining);

    if (remaining <= 0) {
      setIsExpired(true);
      const expiredSession: CheckInSession = {
        ...session,
        status: 'expired'
      };
      storageService.saveCheckIn(expiredSession);
      setSession(expiredSession);

      // No automatic SMS is opened. The UI surfaces a manual escalation
      // control so the user can review the recipient list and message first.
    }
  }, [session]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const startSession = (durationMinutes: number, note?: string) => {
    const now = Date.now();
    const newSession: CheckInSession = {
      id: `checkin_${now}`,
      durationMinutes,
      startTime: now,
      targetTime: now + durationMinutes * 60 * 1000,
      status: 'active',
      note,
      contactsNotified: false
    };
    storageService.saveCheckIn(newSession);
    setSession(newSession);
    setIsExpired(false);
  };

  const confirmSafe = () => {
    if (!session) return;
    const completedSession: CheckInSession = {
      ...session,
      status: 'completed'
    };
    storageService.saveCheckIn(null);
    setSession(null);
    setIsExpired(false);
  };

  const extendSession = (extraMinutes: number) => {
    if (!session) return;
    const now = Date.now();
    const baseTarget = session.status === 'expired' ? now : session.targetTime;
    const updated: CheckInSession = {
      ...session,
      targetTime: baseTarget + extraMinutes * 60 * 1000,
      status: 'active'
    };
    storageService.saveCheckIn(updated);
    setSession(updated);
    setIsExpired(false);
  };

  const cancelSession = () => {
    storageService.saveCheckIn(null);
    setSession(null);
    setIsExpired(false);
  };

  return {
    session,
    remainingSeconds,
    isExpired,
    startSession,
    confirmSafe,
    extendSession,
    cancelSession
  };
}
