import { useEffect, useRef } from 'react';
import { liveUpdatesService } from '../services/liveUpdates';

/**
 * React hook that subscribes to cross-account updates (Supabase Realtime + polling + local broadcast).
 * Automatically cleans up on unmount.
 *
 * @param onUpdate Callback invoked when a relevant donation, claim, or volunteer update occurs.
 * @param deps Dependency array for re-attaching or resetting handlers.
 */
export function useLiveUpdates(onUpdate: () => void, deps: any[] = []) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const unsubscribe = liveUpdatesService.subscribe((_eventType) => {
      if (onUpdateRef.current) {
        onUpdateRef.current();
      }
    });

    return () => {
      unsubscribe();
    };
  }, deps);
}
