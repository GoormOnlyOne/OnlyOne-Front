import { EventSourcePolyfill } from 'event-source-polyfill';
import type { NotificationType } from '../types/notification';

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

export interface NotificationSSEData {
  notificationId: number;
  userId: number;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

class SSEService {
  private eventSource: EventSourcePolyfill | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  connect(
    userId: number,
    onMessage: (data: NotificationSSEData) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void
  ): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';
    const url = new URL(`sse/subscribe`, baseUrl);
    
    const token = localStorage.getItem('accessToken');
    
    // EventSourcePolyfill allows headers unlike native EventSource
    this.eventSource = new EventSourcePolyfill(url.toString(), {
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      withCredentials: true, // Include cookies if needed
      heartbeatTimeout: 60000, // 60 seconds heartbeat timeout
    });

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.reconnectAttempts = 0;
      onOpen?.();
    };

    this.eventSource.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data) as NotificationSSEData;
        console.log('SSE message received:', data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error, event.data);
      }
    };

    // Handle specific event types if backend sends named events
    this.eventSource.addEventListener('notification', (event: any) => {
      try {
        const data = JSON.parse(event.data) as NotificationSSEData;
        console.log('Notification event received:', data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse notification event:', error);
      }
    });

    // Handle heartbeat/ping events
    this.eventSource.addEventListener('ping', () => {
      console.log('SSE ping received');
    });

    this.eventSource.onerror = (error: any) => {
      console.error('SSE connection error:', error);
      onError?.(error);
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect(userId, onMessage, onError, onOpen);
      } else {
        console.error('Max reconnect attempts reached. Please refresh the page.');
      }
    };
  }

  private attemptReconnect(
    userId: number,
    onMessage: (data: NotificationSSEData) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void
  ): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Attempting to reconnect SSE in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect(userId, onMessage, onError, onOpen);
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE connection closed');
    }
    
    this.reconnectAttempts = 0;
  }

  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const sseService = new SSEService();