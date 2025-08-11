// SSE 연결 테스트 유틸리티
import { createSSEConnection } from '../api/notification';

export const testSSEConnection = (userId: number = 1) => {
  console.log(`🔗 SSE 연결 테스트 시작 (userId: ${userId})`);
  
  const eventSource = createSSEConnection(userId);
  
  // 연결 성공
  eventSource.onopen = () => {
    console.log('✅ SSE 연결 성공!');
    console.log('📡 서버에서 실시간 알림을 기다리는 중...');
  };
  
  // 메시지 수신
  eventSource.onmessage = (event) => {
    console.log('📬 SSE 메시지 수신:', event.data);
    try {
      const data = JSON.parse(event.data);
      console.log('📋 파싱된 데이터:', data);
    } catch (e) {
      console.log('📄 원본 텍스트 데이터:', event.data);
    }
  };
  
  // 특정 이벤트 타입 처리
  eventSource.addEventListener('notification', (event) => {
    console.log('🔔 알림 이벤트 수신:', event.data);
    try {
      const notification = JSON.parse(event.data);
      console.log('📮 새 알림:', {
        id: notification.notificationId,
        type: notification.type,
        content: notification.content,
        unreadCount: notification.unreadCount
      });
    } catch (e) {
      console.error('❌ 알림 데이터 파싱 오류:', e);
    }
  });
  
  // 하트비트 이벤트 처리
  eventSource.addEventListener('heartbeat', (event) => {
    console.log('💗 하트비트 수신:', event.data);
  });
  
  // 연결 에러
  eventSource.onerror = (error) => {
    console.error('❌ SSE 연결 오류:', error);
    console.log('🔄 자동 재연결 시도 중...');
  };
  
  // 10초 후 연결 상태 체크
  setTimeout(() => {
    console.log('📊 SSE 연결 상태:', {
      readyState: eventSource.readyState,
      url: eventSource.url,
      status: eventSource.readyState === EventSource.OPEN ? '연결됨' :
              eventSource.readyState === EventSource.CONNECTING ? '연결 중' : '연결 끊김'
    });
  }, 10000);
  
  // 연결 종료 함수 반환
  return {
    close: () => {
      eventSource.close();
      console.log('🔚 SSE 연결 종료됨');
    },
    eventSource
  };
};

// 글로벌 테스트 함수
declare global {
  interface Window {
    testSSE: (userId?: number) => any;
    stopSSE: () => void;
  }
}

let currentSSE: ReturnType<typeof testSSEConnection> | null = null;

window.testSSE = (userId = 1) => {
  if (currentSSE) {
    currentSSE.close();
  }
  currentSSE = testSSEConnection(userId);
  return currentSSE;
};

window.stopSSE = () => {
  if (currentSSE) {
    currentSSE.close();
    currentSSE = null;
  }
};