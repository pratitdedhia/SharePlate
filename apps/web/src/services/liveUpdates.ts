import { supabase, isSupabaseClientConfigured } from '../lib/supabase';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';

export type LiveEventType =
  | 'claim_created'
  | 'claim_updated'
  | 'claim_cancelled'
  | 'donation_created'
  | 'donation_updated'
  | 'donation_cancelled'
  | 'volunteer_assigned'
  | 'pickup_confirmed'
  | 'delivery_confirmed'
  | 'claim_disputed'
  | 'state_synced';

type ChangeListener = (eventType: string, payload?: any) => void;

class LiveUpdatesService {
  private listeners: Set<ChangeListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private unsubFbDonations: Unsubscribe | null = null;
  private unsubFbClaims: Unsubscribe | null = null;
  private pollingTimer: any = null;
  private debounceTimer: any = null;
  private isSubscribedToSupabase = false;

  constructor() {
    this.initBroadcastChannel();
    this.initWindowEventListener();
    this.initStorageEventListener();
    this.initFirebaseRealtime();
  }

  private initStorageEventListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('shareplate_')) {
          this.notifyListeners('storage_sync', { key: event.key });
        }
      });
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('shareplate_live_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.notifyListeners(event.data.type, event.data.payload);
          }
        };
      } catch (err) {
        console.warn('[LiveUpdates] BroadcastChannel not supported:', err);
      }
    }
  }

  private initWindowEventListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('shareplate:state_changed', ((e: CustomEvent) => {
        if (e.detail && e.detail.type) {
          this.notifyListeners(e.detail.type, e.detail.payload);
        }
      }) as EventListener);
    }
  }

  /**
   * Initializes Firebase Firestore onSnapshot listeners for live multi-user sync.
   */
  public initFirebaseRealtime() {
    if (!db || !isFirebaseConfigured || typeof window === 'undefined' || this.unsubFbDonations) {
      return;
    }

    try {
      this.unsubFbDonations = onSnapshot(
        collection(db, 'donations'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              this.notifyListeners('donation_created', change.doc.data());
            } else if (change.type === 'modified') {
              this.notifyListeners('donation_updated', change.doc.data());
            } else if (change.type === 'removed') {
              this.notifyListeners('donation_cancelled', change.doc.data());
            }
          });
        },
        (err) => {
          console.warn('[LiveUpdates] Firebase donations stream notice:', err.message);
        }
      );

      this.unsubFbClaims = onSnapshot(
        collection(db, 'claims'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              this.notifyListeners('claim_created', change.doc.data());
            } else if (change.type === 'modified') {
              this.notifyListeners('claim_updated', change.doc.data());
            } else if (change.type === 'removed') {
              this.notifyListeners('claim_cancelled', change.doc.data());
            }
          });
        },
        (err) => {
          console.warn('[LiveUpdates] Firebase claims stream notice:', err.message);
        }
      );
    } catch (err) {
      console.warn('[LiveUpdates] Firebase real-time attach notice:', err);
    }
  }

  /**
   * Initializes Supabase Realtime websocket subscriptions if configured.
   */
  public initSupabaseRealtime() {
    if (!isSupabaseClientConfigured || !supabase || this.isSubscribedToSupabase) {
      return;
    }

    try {
      this.supabaseChannel = supabase
        .channel('shareplate-public-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'donations' },
          (payload) => {
            this.notifyChange('donation_updated', payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'claims' },
          (payload) => {
            this.notifyChange('claim_updated', payload);
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            this.isSubscribedToSupabase = true;
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('[LiveUpdates] Supabase Realtime channel error:', err);
            this.isSubscribedToSupabase = false;
          }
        });
    } catch (err) {
      console.warn('[LiveUpdates] Failed to initialize Supabase Realtime:', err);
    }
  }

  /**
   * Starts a fallback polling timer if there are active listeners.
   */
  private startPolling() {
    if (this.pollingTimer || typeof window === 'undefined') return;
    this.pollingTimer = setInterval(() => {
      if (this.listeners.size > 0) {
        this.notifyListeners('polling_tick', { timestamp: Date.now() });
      }
    }, 6000); // Poll every 6 seconds
  }

  private stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Broadcasts a state change across components, tabs, and listeners.
   */
  public notifyChange(type: LiveEventType | string, actionOrPayload?: any, optionalPayload?: any) {
    const payload = optionalPayload !== undefined ? optionalPayload : actionOrPayload;
    const eventName = optionalPayload !== undefined ? `${type}_${actionOrPayload}`.toLowerCase() : type;

    // 1. Broadcast to other tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: eventName, payload });
      } catch {}
    }

    // 2. Dispatch custom window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shareplate:state_changed', { detail: { type: eventName, payload } }));
    }

    // 3. Notify intra-process subscribers with light debouncing for batch stability
    this.debounceNotify(eventName, payload);
  }

  private debounceNotify(type: string, payload?: any) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.notifyListeners(type, payload);
      this.debounceTimer = null;
    }, 30);
  }

  private notifyListeners(type: string, payload?: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(type, payload);
      } catch (err) {
        console.error('[LiveUpdates] Error in event listener callback:', err);
      }
    });
  }

  /**
   * Subscribes a React component callback to real-time events.
   */
  public subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);

    if (this.listeners.size === 1) {
      this.startPolling();
      this.initFirebaseRealtime();
      this.initSupabaseRealtime();
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  public getSubscriberCount(): number {
    return this.listeners.size;
  }
}

export const liveUpdatesService = new LiveUpdatesService();
