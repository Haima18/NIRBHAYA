import { useState, useEffect, useCallback } from 'react';
import { Journey, JourneyWaypoint } from '@/types';
import { storageService } from '@/services/storage/storageService';
import { locationService } from '@/services/location/locationService';

export function useJourney() {
  const [journey, setJourney] = useState<Journey | null>(() => storageService.getJourney());
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!journey || journey.status !== 'in_progress') {
      setIsOverdue(false);
      return;
    }
    const check = () => setIsOverdue(Date.now() > journey.targetArrivalTime);
    check();
    const timer = setInterval(check, 15000);
    return () => clearInterval(timer);
  }, [journey]);

  const startJourney = async (destination: string, etaMinutes: number, shareWithCircle = false) => {
    const now = Date.now();
    let initialCoords: { lat: number; lng: number } | undefined;

    const locRes = await locationService.getCurrentPosition();
    if (locRes.success && locRes.coords) {
      initialCoords = locRes.coords;
    }

    const newJourney: Journey = {
      id: `journey_${now}`,
      destination,
      etaMinutes,
      startTime: now,
      targetArrivalTime: now + etaMinutes * 60 * 1000,
      status: 'in_progress',
      currentLocation: initialCoords,
      waypoints: initialCoords ? [{ ...initialCoords, timestamp: now }] : [],
      shareWithCircle
    };

    storageService.saveJourney(newJourney);
    setJourney(newJourney);
    setIsTracking(true);
  };

  const updateLocation = useCallback(async () => {
    if (!journey || journey.status !== 'in_progress') return;

    const res = await locationService.getCurrentPosition();
    if (res.success && res.coords) {
      const now = Date.now();
      const newPoint: JourneyWaypoint = { ...res.coords, timestamp: now };
      const updated: Journey = {
        ...journey,
        currentLocation: res.coords,
        waypoints: [...journey.waypoints, newPoint].slice(-50)
      };
      storageService.saveJourney(updated);
      setJourney(updated);
      setTrackingError(null);
    } else if (res.error) {
      setTrackingError(res.error);
    }
  }, [journey]);

  useEffect(() => {
    if (journey && journey.status === 'in_progress') {
      const interval = setInterval(updateLocation, 20000); // Poll location every 20s
      return () => clearInterval(interval);
    }
  }, [journey, updateLocation]);

  const confirmArrival = () => {
    if (!journey) return;
    const completed: Journey = {
      ...journey,
      status: 'arrived'
    };
    storageService.saveJourney(null);
    setJourney(null);
    setIsTracking(false);
  };

  const cancelJourney = () => {
    storageService.saveJourney(null);
    setJourney(null);
    setIsTracking(false);
  };

  return {
    journey,
    isTracking,
    isOverdue,
    trackingError,
    startJourney,
    updateLocation,
    confirmArrival,
    cancelJourney
  };
}
