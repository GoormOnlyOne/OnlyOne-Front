import { EventSourcePolyfill } from 'event-source-polyfill';
import type { Notification } from '../types/notification';

export type SSEEventType = 'notification' | 'unread-count' | 'heartbeat';

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
}

export interface NotificationEvent extends SSEEvent {
  type: 'notification';
  data: Notification;
}

export interface UnreadCountEvent extends SSEEvent {
  type: 'unread-count';
  data: { count: number };
}

export interface HeartbeatEvent extends SSEEvent {
  type: 'heartbeat';
  data: Record<string, never>;
}

export class NotificationService {
  private eventSource: EventSourcePolyfill | null = null;
  private userId: number | null = null;
  private listeners: Map<SSEEventType, Set<(event: SSEEvent) => void>> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.listeners.set('notification', new Set());
    this.listeners.set('unread-count', new Set());
    this.listeners.set('heartbeat', new Set());
  }

  async connect(userId: number): Promise<void> {
    // 이미 연결 중이거나 연결되어 있으면 중복 방지
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    try {
      // 기존 연결이 있으면 정리
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      // SSE 연결 with EventSource polyfill
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';
      const url = new URL(`sse/subscribe`, baseUrl);
      
      const token = localStorage.getItem('accessToken');
      
      this.eventSource = new EventSourcePolyfill(url.toString(), {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
        withCredentials: true,
        heartbeatTimeout: 60000,
      });
      
      this.setupEventListeners();
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  disconnect(): void {
    this.isConnecting = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  }

  addEventListener<T extends SSEEventType>(
    type: T,
    listener: (event: SSEEvent) => void,
  ): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.add(listener);
    }
  }

  removeEventListener<T extends SSEEventType>(
    type: T,
    listener: (event: SSEEvent) => void,
  ): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.addEventListener('notification', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.emitEvent('notification', data);
      } catch {
        // Event parsing failed
      }
    });

    this.eventSource.addEventListener('unread-count', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.emitEvent('unread-count', data);
      } catch {
        // Event parsing failed
      }
    });

    this.eventSource.addEventListener('heartbeat', (event: any) => {
      try {
        // heartbeat는 단순 문자열일 수 있으므로 JSON 파싱을 시도하되, 실패하면 문자열 그대로 사용
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          // JSON이 아닌 경우 문자열 그대로 사용
          data = { status: event.data as string };
        }
        this.emitEvent('heartbeat', data);
      } catch {
        // Heartbeat event processing failed
      }
    });

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false; // 연결 완료
    };

    this.eventSource.onerror = () => {
      this.isConnecting = false; // 연결 실패
      this.handleReconnect();
    };
  }

  private emitEvent(type: SSEEventType, data: unknown): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const event: SSEEvent = { type, data };
      listeners.forEach(listener => listener(event));
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(async () => {
      if (this.userId) {
        this.disconnect();
        await this.connect(this.userId);
      }
    }, delay);
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const notificationService = new NotificationService();
