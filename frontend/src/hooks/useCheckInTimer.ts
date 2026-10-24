import { useState, useEffect, useCallback } from 'react';
import { CheckInSession } from '@/types';
import { storageService } from '@/services/storage/storageService';
import { notificationService } from '@/services/notifications/notificationService';

export function useCheckInTimer() {
  const [session, setSession] = useState<CheckInSession | null>(() => storageService.getCheckIn());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Recalculate remaining seconds
  const tick = useCallback(() => {
    if (!session || session.status !== 'active') {
      setRemainingSeconds(0);
      setIsExpired(false);
      return;
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((session.targetTime - now) / 1000));
    setRemainingSeconds(remaining);

    if (remaining <= 0) {
      setIsExpired(true);
      if (session.status === 'active') {
        const expiredSession: CheckInSession = {
          ...session,
          status: 'expired'
        };
        storageService.saveCheckIn(expiredSession);
        setSession(expiredSession);

        // Notify if not already notified
        if (!session.contactsNotified) {
          const contacts = storageService.getTrustedContacts().filter(c => c.notifyOnCheckInMissed);
          notificationService.draftTrustedContactsAlert(
            contacts,
            null,
            'Check-in timer deadline was missed. Please check on me.'
          );
        }
      }
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
