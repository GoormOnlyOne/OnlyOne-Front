import {
  generateFCMToken,
  setupForegroundMessageListener,
} from '../config/firebase';

export class FCMService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  constructor() {
    // 브라우저 환경에서만 포그라운드 리스너 설정 (SSR 안전성)
    if (typeof window !== 'undefined') {
      this.setupForegroundListener();
    }
  }

  /**
   * FCM 서비스 초기화
   */
  async initialize(): Promise<boolean> {
    try {
      // 이미 초기화되고 토큰이 있는 경우 빠른 반환 (멱등성)
      if (this.isInitialized && this.fcmToken) {
        return true;
      }

      
      // 서비스 워커 등록
      await this.registerServiceWorker();

      // FCM 토큰 발급
      this.fcmToken = await generateFCMToken();

      if (this.fcmToken) {
        this.isInitialized = true;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 서비스 워커 등록
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        // 서비스 워커가 업데이트될 때까지 기다림
        await navigator.serviceWorker.ready;
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error('이 브라우저는 서비스 워커를 지원하지 않습니다.');
    }
  }

  /**
   * 포그라운드 메시지 리스너 설정
   */
  private setupForegroundListener(): void {
    setupForegroundMessageListener();
  }

  /**
   * FCM 토큰 가져오기
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * FCM 토큰을 백엔드로 전송
   */
  async sendTokenToBackend(): Promise<boolean> {
    if (!this.fcmToken) {
      return false;
    }

    try {

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';
      const url = new URL(
        `users/fcm-token?fcmToken=${encodeURIComponent(this.fcmToken)}`,
        baseUrl,
      ).toString();

      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  getNotificationPermission(): NotificationPermission {
    return typeof Notification !== 'undefined'
      ? Notification.permission
      : 'denied';
  }

  /**
   * 알림 권한 요청
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      if (typeof Notification === 'undefined') {
        return 'denied';
      }

      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      return 'denied';
    }
  }

  /**
   * FCM 서비스 상태 확인
   */
  isReady(): boolean {
    return this.isInitialized && this.fcmToken !== null;
  }

  /**
   * FCM 토큰 갱신
   */
  async refreshToken(): Promise<string | null> {
    try {
      this.fcmToken = await generateFCMToken();

      if (this.fcmToken) {
      } else {
      }

      return this.fcmToken;
    } catch (error) {
      return null;
    }
  }
}

// 싱글톤 인스턴스
const fcmService = new FCMService();
export default fcmService;
