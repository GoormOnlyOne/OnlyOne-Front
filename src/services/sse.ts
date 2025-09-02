import { EventSourcePolyfill } from 'event-source-polyfill';

export interface SSEEvent {
  id?: string;
  type: string;
  data: unknown;
  timestamp: number;
}

export class SSEService {
  private eventSource: EventSourcePolyfill | null = null;
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((event: SSEEvent) => void)[]> = new Map();
  private lastEventId: string | null = null;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        
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

        this.eventSource.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.eventSource.onmessage = (event: any) => {
          this.handleMessage(event);
        };

        this.eventSource.onerror = () => {
          if (this.reconnectAttempts === 0) {
            reject(new Error('Failed to establish SSE connection'));
          }
          this.handleReconnect();
        };

        // 커스텀 이벤트 리스너들 추가
        const eventTypes = [
          'notification',
          'chat',
          'settlement',
          'like',
          'comment',
        ];
        eventTypes.forEach(type => {
          this.eventSource?.addEventListener(type, (event: any) => {
            this.handleMessage(event, type);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent, eventType?: string) {
    try {
      const data = JSON.parse(event.data);
      const sseEvent: SSEEvent = {
        id: event.lastEventId || undefined,
        type: eventType || 'message',
        data,
        timestamp: Date.now(),
      };

      // Last-Event-ID 저장
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
      }

      // 등록된 리스너들에게 이벤트 전달
      const listeners = this.listeners.get(sseEvent.type) || [];
      listeners.forEach(listener => listener(sseEvent));

      // 전체 이벤트 리스너에게도 전달
      const allListeners = this.listeners.get('*') || [];
      allListeners.forEach(listener => listener(sseEvent));
      
      // 알림 관련 이벤트를 window에 dispatch
      if (sseEvent.type === 'notification') {
        // 새 알림 수신 이벤트
        window.dispatchEvent(new CustomEvent('notification-received', {
          detail: sseEvent.data
        }));
        
        // 읽지 않은 개수 업데이트 이벤트 (data에 unreadCount가 있는 경우)
        const data = sseEvent.data as { unreadCount?: number };
        if (data.unreadCount !== undefined) {
          window.dispatchEvent(new CustomEvent('unread-count-updated', {
            detail: { count: data.unreadCount }
          }));
        }
      }
    } catch {
      // SSE 메시지 파싱 실패 무시
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.disconnect();
        this.connect(this.userId).catch(() => {
          // 재연결 실패 무시
        });
      }
    }, delay);
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // 페이지가 숨겨졌을 때는 연결을 유지하되, 재연결 시도는 중단
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    } else {
      if (this.userId && (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED)) {
        // 페이지가 다시 보여졌을 때 연결이 끊어져 있으면 재연결
        this.connect(this.userId).catch(() => {
          // 재연결 실패 무시
        });
      }
    }
  }

  addEventListener(eventType: string, callback: (event: SSEEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (event: SSEEvent) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
  }

  getConnectionState(): 'CONNECTING' | 'OPEN' | 'CLOSED' {
    if (!this.eventSource) return 'CLOSED';

    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'CONNECTING';
      case EventSource.OPEN:
        return 'OPEN';
      case EventSource.CLOSED:
        return 'CLOSED';
      default:
        return 'CLOSED';
    }
  }

  destroy() {
    this.disconnect();
    this.listeners.clear();
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
  }
}

// 싱글톤 인스턴스
const sseService = new SSEService();
export default sseService;
