import { supabase, isSupabaseClientConfigured } from '../lib/supabase';

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
  private pollingTimer: any = null;
  private debounceTimer: any = null;
  private isSubscribedToSupabase = false;

  constructor() {
    this.initBroadcastChannel();
    this.initWindowEventListener();
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

    // 3. Notify local listeners with debouncing to prevent UI thrashing
    this.notifyListeners(eventName, payload);
  }

  private notifyListeners(type: string, payload?: any) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.listeners.forEach((listener) => {
        try {
          listener(type, payload);
        } catch (err) {
          console.error('[LiveUpdates] Error in listener callback:', err);
        }
      });
    }, 150);
  }

  /**
   * Subscribes a callback to live updates and returns an unsubscribe function.
   */
  public subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    if (!this.isSubscribedToSupabase) {
      this.initSupabaseRealtime();
    }
    this.startPolling();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  public cleanup() {
    this.stopPolling();
    this.listeners.clear();
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.supabaseChannel && supabase) {
      supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
      this.isSubscribedToSupabase = false;
    }
  }
}

export const liveUpdatesService = new LiveUpdatesService();
