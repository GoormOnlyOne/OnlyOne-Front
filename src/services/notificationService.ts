import { createSSEConnection } from '../api/notification';
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
  private isConnecting = false;
  private lastHeartbeatLog = 0;

  constructor() {
    this.listeners.set('notification', new Set());
    this.listeners.set('unread-count', new Set());
    this.listeners.set('heartbeat', new Set());
  }

  async connect(userId: number): Promise<void> {
    // 이미 연결 중이거나 연결되어 있으면 중복 방지
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      console.log('🔄 SSE 연결 이미 존재 또는 진행 중 - 생략', {
        isConnecting: this.isConnecting,
        readyState: this.eventSource?.readyState,
        userId
      });
      return;
    }

    console.log('🔄 NotificationService SSE 연결 시작', { userId, timestamp: new Date().toISOString() });
    this.isConnecting = true;
    this.userId = userId;
    
    try {
      // 기존 연결이 있으면 정리
      if (this.eventSource) {
        console.log('🔌 기존 SSE 연결 정리 중...');
        this.eventSource.close();
        this.eventSource = null;
      }
      
      // SSE 연결
      console.log('🌐 새로운 SSE 연결 생성 시작', { userId });
      this.eventSource = createSSEConnection(userId);
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ NotificationService SSE 연결 실패:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  disconnect(): void {
    console.log('🔌 NotificationService SSE 연결 종료 시작', {
      isConnected: this.isConnected(),
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      timestamp: new Date().toISOString()
    });
    
    this.isConnecting = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
    console.log('✅ NotificationService SSE 연결 종료 완료');
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
        console.log('📢 알림 이벤트 수신:', {
          data: event.data.substring(0, 100) + '...',
          lastEventId: event.lastEventId,
          timestamp: new Date().toISOString()
        });
        const data = JSON.parse(event.data);
        this.emitEvent('notification', data);
      } catch (error) {
        console.error('❌ 알림 이벤트 파싱 실패:', error);
      }
    });

    this.eventSource.addEventListener('unread-count', (event) => {
      try {
        console.log('📊 안읽은 알림 수 이벤트 수신:', {
          data: event.data,
          timestamp: new Date().toISOString()
        });
        const data = JSON.parse(event.data);
        this.emitEvent('unread-count', data);
      } catch (error) {
        console.error('❌ 안읽은 알림 수 이벤트 파싱 실패:', error);
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
        // heartbeat 로그는 5초마다만 출력하여 로그 스팸 방지
        const now = Date.now();
        if (!this.lastHeartbeatLog || now - this.lastHeartbeatLog > 5000) {
          console.log('💚 SSE Heartbeat 확인:', {
            data: event.data,
            timestamp: new Date().toISOString()
          });
          this.lastHeartbeatLog = now;
        }
        this.emitEvent('heartbeat', data);
      } catch (error) {
        console.error('❌ Heartbeat 이벤트 처리 실패:', error);
      }
    });

    this.eventSource.onopen = () => {
      console.log('✅ NotificationService SSE 연결 성공!', {
        userId: this.userId,
        readyState: this.eventSource?.readyState,
        reconnectAttempts: this.reconnectAttempts,
        timestamp: new Date().toISOString()
      });
      this.reconnectAttempts = 0;
      this.isConnecting = false; // 연결 완료
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ NotificationService SSE 연결 에러:', {
        error,
        userId: this.userId,
        readyState: this.eventSource?.readyState,
        reconnectAttempts: this.reconnectAttempts,
        timestamp: new Date().toISOString()
      });
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
      console.error('🚫 NotificationService 최대 재연결 시도 횟수 도달', {
        maxAttempts: this.maxReconnectAttempts,
        userId: this.userId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log('🔄 NotificationService 재연결 예약', {
      delay: `${delay}ms`,
      attempt: `${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });

    setTimeout(async () => {
      if (this.userId) {
        console.log('🔄 NotificationService 재연결 시도 실행', { userId: this.userId });
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