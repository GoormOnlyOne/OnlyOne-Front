// SSE 연결 테스트 유틸리티
import { createSSEConnection } from '../api/notification';

export const testSSEConnection = (userId: number = 1) => {
  const eventSource = createSSEConnection(userId);

  // 연결 성공
  eventSource.onopen = () => {
    // Connection successful - removed console log
  };

  // 메시지 수신
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Message received and parsed - removed console log
    } catch (e) {
      // Raw text data received - removed console log
    }
  };

  // 특정 이벤트 타입 처리
  eventSource.addEventListener('notification', (event) => {
    try {
      const notification = JSON.parse(event.data);
      // Notification received - removed console log
    } catch (e) {
      // Notification data parsing error - removed console log
    }
  });

  // 하트비트 이벤트 처리
  eventSource.addEventListener('heartbeat', (event) => {
    // Heartbeat received - removed console log
  });

  // 연결 에러
  eventSource.onerror = (error) => {
    // Connection error - auto reconnection will be attempted - removed console log
  };

  // 10초 후 연결 상태 체크
  setTimeout(() => {
    // Connection status checked - removed console log
  }, 10000);

  // 연결 종료 함수 반환
  return {
    close: () => {
      eventSource.close();
    },
    eventSource,
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
