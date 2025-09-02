import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Jest 테스트 환경(Node.js)에서 사용할 MSW 서버 설정
// 실제 백엔드 API 대신 모킹된 응답을 반환
export const server = setupServer(...handlers);