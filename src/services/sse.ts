import { createSSEConnection } from '../api/notification';

export interface SSEEvent {
  id?: string;
  type: string;
  data: any;
  timestamp: number;
}

export class SSEService {
  private eventSource: EventSource | null = null;
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
        console.log('🔄 SSE 연결 시도 시작', {
          userId,
          timestamp: new Date().toISOString(),
        });
        this.userId = userId;
        this.eventSource = createSSEConnection(
          userId,
          this.lastEventId || undefined,
        );

        this.eventSource.onopen = () => {
          console.log('✅ SSE 연결 성공!', {
            userId,
            readyState: this.eventSource?.readyState,
            timestamp: new Date().toISOString(),
            reconnectAttempts: this.reconnectAttempts,
          });
          this.reconnectAttempts = 0;
          resolve();
        };

        this.eventSource.onmessage = event => {
          console.log('📨 SSE 기본 메시지 수신:', {
            data: event.data,
            lastEventId: event.lastEventId,
            timestamp: new Date().toISOString(),
          });
          this.handleMessage(event);
        };

        this.eventSource.onerror = error => {
          console.error('❌ SSE 연결 에러 발생:', {
            error,
            errorType: error.type,
            userId,
            readyState: this.eventSource?.readyState,
            url: this.eventSource?.url,
            reconnectAttempts: this.reconnectAttempts,
            timestamp: new Date().toISOString(),
          });

          // readyState에 따른 상세 에러 정보
          if (this.eventSource) {
            const readyStateText =
              {
                0: 'CONNECTING',
                1: 'OPEN',
                2: 'CLOSED',
              }[this.eventSource.readyState] || 'UNKNOWN';

            console.error('🔍 SSE 상태 상세:', {
              readyState: this.eventSource.readyState,
              readyStateText,
              url: this.eventSource.url,
            });
          }

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
          this.eventSource?.addEventListener(type, event => {
            this.handleMessage(event as MessageEvent, type);
          });
        });
      } catch (error) {
        console.error('Failed to create SSE connection:', error);
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

      console.log('📬 SSE 이벤트 처리 완료:', {
        type: sseEvent.type,
        id: sseEvent.id,
        dataPreview: JSON.stringify(data).substring(0, 100) + '...',
        listenersCount: {
          specific: (this.listeners.get(sseEvent.type) || []).length,
          all: (this.listeners.get('*') || []).length,
        },
        timestamp: new Date(sseEvent.timestamp).toISOString(),
      });

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
        if (sseEvent.data.unreadCount !== undefined) {
          window.dispatchEvent(new CustomEvent('unread-count-updated', {
            detail: { count: sseEvent.data.unreadCount }
          }));
        }
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 SSE 최대 재연결 시도 횟수 도달', {
        maxAttempts: this.maxReconnectAttempts,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log('🔄 SSE 재연결 예약', {
      delay: `${delay}ms`,
      attempt: `${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        console.log('🔄 SSE 재연결 시도 실행', { userId: this.userId });
        this.disconnect();
        this.connect(this.userId).catch(error => {
          console.error('❌ SSE 재연결 실패:', error);
        });
      }
    }, delay);
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      console.log('👁️ 페이지 숨김 - SSE 재연결 시도 중단', {
        currentState: this.getConnectionState(),
        hasReconnectTimeout: !!this.reconnectTimeout,
      });
      // 페이지가 숨겨졌을 때는 연결을 유지하되, 재연결 시도는 중단
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    } else {
      console.log('👁️ 페이지 표시 - SSE 연결 상태 확인', {
        currentState: this.getConnectionState(),
        userId: this.userId,
        needsReconnect:
          this.userId &&
          (!this.eventSource ||
            this.eventSource.readyState === EventSource.CLOSED),
      });

      if (
        this.userId &&
        (!this.eventSource ||
          this.eventSource.readyState === EventSource.CLOSED)
      ) {
        // 페이지가 다시 보여졌을 때 연결이 끊어져 있으면 재연결
        console.log('🔄 페이지 복귀 후 SSE 재연결 시작');
        this.connect(this.userId).catch(error => {
          console.error('❌ 페이지 복귀 후 SSE 재연결 실패:', error);
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
    console.log('🔌 SSE 연결 종료 시작', {
      currentState: this.getConnectionState(),
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      timestamp: new Date().toISOString(),
    });

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    console.log('✅ SSE 연결 종료 완료');
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
