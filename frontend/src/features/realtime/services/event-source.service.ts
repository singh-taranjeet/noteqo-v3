import { API_BASE_URL } from "@/constants/config";
import { storageService, STORAGE_KEYS } from "@/features/storage";
import { logService } from "@/services/log.service";
import type { RealtimeNoteEvent } from "../types/realtime.types";
import { SYNC_EVENTS } from "@/features/shared/constants/sync-events.constants";

/**
 * Singleton service managing an EventSource (SSE) connection
 * to the backend for real-time collaboration events.
 *
 * Connection lifecycle:
 * 1. connect() opens the SSE stream with JWT + spaceIds
 * 2. Events are dispatched as CustomEvents on globalThis
 * 3. EventSource natively reconnects on network failures
 * 4. disconnect() closes the connection on logout/unmount
 */
class EventSourceService {
  private eventSource: EventSource | null = null;
  private spaceIds: string[] = [];

  /**
   * Opens an SSE connection for the given spaces.
   * Closes any existing connection first.
   */
  async connect(spaceIds: string[]): Promise<void> {
    this.disconnect();
    this.spaceIds = spaceIds;

    if (spaceIds.length === 0) {
      logService.warn("EventSourceService: No spaceIds to subscribe to");
      return;
    }

    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);
    if (!token) {
      logService.warn("EventSourceService: No JWT token, skipping SSE connect");
      return;
    }

    const params = new URLSearchParams({
      token,
      spaceIds: spaceIds.join(","),
    });

    const url = `${API_BASE_URL}/events/stream?${params.toString()}`;

    try {
      this.eventSource = new EventSource(url);

      // Listen for each event type
      const eventTypes = [
        "NOTE_CREATED",
        "NOTE_UPDATED",
        "NOTE_DELETED",
        "NOTE_RESTORED",
        "SPACE_UPDATED",
        "SPACE_MEMBER_ADDED",
        "SPACE_MEMBER_REMOVED",
        "MEDIA_UPLOADED",
        "MEDIA_DELETED",
      ];

      for (const eventType of eventTypes) {
        this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data as string) as RealtimeNoteEvent;
            console.log("Data", data);
            globalThis.dispatchEvent(
              new CustomEvent(SYNC_EVENTS.REAL_TIME_EVENT(eventType), { detail: data }),
            );
          } catch (err) {
            logService.error(`Failed to parse SSE event ${eventType}: ${err}`);
          }
        });
      }

      this.eventSource.onerror = () => {
        logService.warn(
          "SSE connection error, EventSource will auto-reconnect",
        );
      };

      logService.info(`SSE connected for ${spaceIds.length} space(s)`);
    } catch (err) {
      logService.error(`Failed to open SSE connection: ${err}`);
    }
  }

  /**
   * Reconnects with the same spaceIds (e.g., after token refresh).
   */
  async reconnect(): Promise<void> {
    if (this.spaceIds.length > 0) {
      await this.connect(this.spaceIds);
    }
  }

  /**
   * Closes the SSE connection.
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      logService.info("SSE disconnected");
    }
  }

  /**
   * Whether the SSE connection is currently open.
   */
  get isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const eventSourceService = new EventSourceService();
