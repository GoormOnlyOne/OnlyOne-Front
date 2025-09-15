// SSE 연결 테스트 유틸리티
import { sseService } from '../services/sseService';

export const testSSEConnection = (userId: number = 1) => {
  // SSE 서비스를 사용하여 연결
  sseService.connect(
    userId,
    (data) => {
      // Message received
      console.log('SSE notification received:', data);
    },
    (error: Event) => {
      // Connection error
      console.error('SSE connection error:', error);
    },
    () => {
      // Connection opened
      console.log('SSE connection established');
    }
  );

  // 연결 종료 함수 반환
  return {
    close: () => {
      sseService.disconnect();
    },
    isConnected: () => sseService.isConnected(),
    getReadyState: () => sseService.getReadyState(),
  };
};

// 글로벌 테스트 함수
declare global {
  interface Window {
    testSSE: (userId?: number) => ReturnType<typeof testSSEConnection>;
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
