import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { server } from './mocks/server';

// TextEncoder/TextDecoder polyfill for Jest
Object.assign(global, { TextDecoder, TextEncoder });

// MSW 서버 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// EventSource mock
class EventSourceMock {
  url: string;
  readyState: number = 0;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  
  constructor(url: string) {
    this.url = url;
    this.readyState = 0;
  }
  
  addEventListener(event: string, callback: (event: any) => void) {
    if (event === 'open') this.onopen = callback;
    if (event === 'message') this.onmessage = callback;
    if (event === 'error') this.onerror = callback;
  }
  
  removeEventListener() {}
  
  close() {
    this.readyState = 2;
  }
}

global.EventSource = EventSourceMock as any;

// window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});