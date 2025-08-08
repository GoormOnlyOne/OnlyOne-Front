import { createSSEConnection } from '../api/notification';
import FCMService from './fcm';
import type { Notification } from '../types/notification';

export type SSEEventType = 'notification' | 'unread-count' | 'heartbeat';

export interface SSEEvent {
  type: SSEEventType;
  data: any;
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
  data: {};
}

export class NotificationService {
  private eventSource: EventSource | null = null;
  private userId: number | null = null;
  private listeners: Map<SSEEventType, Set<(event: SSEEvent) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private fcmToken: string | null = null;
  private fcmInitialized = false;
  private isConnecting = false;

  constructor() {
    this.listeners.set('notification', new Set());
    this.listeners.set('unread-count', new Set());
    this.listeners.set('heartbeat', new Set());
  }

  async initializeFCM(userId: number): Promise<void> {
    if (this.fcmInitialized) return;

    try {
      this.fcmToken = await FCMService.getToken();
      if (this.fcmToken) {
        const success = await FCMService.sendTokenToServer(this.fcmToken, userId);
        if (success) {
          console.log('FCM token registered successfully');
        } else {
          console.warn('Failed to register FCM token');
        }
      }

      FCMService.setupMessageListener((payload) => {
        console.log('FCM message received:', payload);
        
        const notificationData: Notification = {
          notificationId: payload.data?.notificationId ? parseInt(payload.data.notificationId) : Date.now(),
          content: payload.notification?.body || payload.data?.content || '',
          type: payload.data?.type || 'COMMENT',
          isRead: false,
          createdAt: new Date().toISOString()
        };

        this.emitEvent('notification', notificationData);
      });

      this.fcmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
    }
  }

  async connect(userId: number): Promise<void> {
    // 이미 연결 중이거나 연결되어 있으면 중복 방지
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      console.log('SSE connection already exists or in progress, skipping');
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    
    try {
      // FCM 초기화 (한 번만)
      if (!this.fcmInitialized) {
        await this.initializeFCM(userId);
      }
      
      // 기존 연결이 있으면 정리
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      
      // SSE 연결
      console.log('Creating new SSE connection for userId:', userId);
      this.eventSource = createSSEConnection(userId);
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
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
    console.log('SSE connection disconnected');
  }

  addEventListener<T extends SSEEventType>(
    type: T,
    listener: (event: SSEEvent) => void
  ): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.add(listener);
    }
  }

  removeEventListener<T extends SSEEventType>(
    type: T,
    listener: (event: SSEEvent) => void
  ): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.addEventListener('notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emitEvent('notification', data);
      } catch (error) {
        console.error('Failed to parse notification event:', error);
      }
    });

    this.eventSource.addEventListener('unread-count', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emitEvent('unread-count', data);
      } catch (error) {
        console.error('Failed to parse unread-count event:', error);
      }
    });

    this.eventSource.addEventListener('heartbeat', (event) => {
      try {
        // heartbeat는 단순 문자열일 수 있으므로 JSON 파싱을 시도하되, 실패하면 문자열 그대로 사용
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (parseError) {
          // JSON이 아닌 경우 문자열 그대로 사용
          data = { status: event.data };
        }
        this.emitEvent('heartbeat', data);
        // heartbeat 로그는 너무 빈번하므로 생략
      } catch (error) {
        console.error('Failed to handle heartbeat event:', error);
      }
    });

    this.eventSource.onopen = () => {
      console.log('SSE connection opened successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false; // 연결 완료
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.isConnecting = false; // 연결 실패
      this.handleReconnect();
    };
  }

  private emitEvent(type: SSEEventType, data: any): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const event: SSEEvent = { type, data };
      listeners.forEach(listener => listener(event));
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(async () => {
      if (this.userId) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
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