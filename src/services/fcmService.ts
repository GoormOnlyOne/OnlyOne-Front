import { generateFCMToken, setupForegroundMessageListener } from '../config/firebase';

export class FCMService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  constructor() {
    this.setupForegroundListener();
  }

  /**
   * FCM 서비스 초기화
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 FCM 서비스 초기화 시작');
      
      // 서비스 워커 등록
      await this.registerServiceWorker();
      
      // FCM 토큰 발급
      this.fcmToken = await generateFCMToken();
      
      if (this.fcmToken) {
        console.log('✅ FCM 서비스 초기화 성공');
        this.isInitialized = true;
        return true;
      } else {
        console.log('❌ FCM 토큰 발급 실패');
        return false;
      }
    } catch (error) {
      console.error('❌ FCM 서비스 초기화 실패:', error);
      return false;
    }
  }

  /**
   * 서비스 워커 등록
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ FCM 서비스 워커 등록 성공:', registration);
        
        // 서비스 워커가 업데이트될 때까지 기다림
        await navigator.serviceWorker.ready;
        console.log('✅ FCM 서비스 워커 준비 완료');
      } catch (error) {
        console.error('❌ FCM 서비스 워커 등록 실패:', error);
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
    console.log('🔔 포그라운드 FCM 리스너 설정 완료');
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
  async sendTokenToBackend(userId: number): Promise<boolean> {
    if (!this.fcmToken) {
      console.error('❌ FCM 토큰이 없습니다.');
      return false;
    }

    try {
      console.log('📤 FCM 토큰을 백엔드로 전송 중...', {
        userId,
        token: this.fcmToken.substring(0, 20) + '...'
      });

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';
      const url = new URL(`users/fcm-token?fcmToken=${encodeURIComponent(this.fcmToken)}`, baseUrl).toString();
      
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers
      });

      if (response.ok) {
        console.log('✅ FCM 토큰 백엔드 전송 성공');
        return true;
      } else {
        console.error('❌ FCM 토큰 백엔드 전송 실패:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ FCM 토큰 백엔드 전송 중 오류:', error);
      return false;
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  getNotificationPermission(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * 알림 권한 요청
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 알림 권한 상태:', permission);
      return permission;
    } catch (error) {
      console.error('❌ 알림 권한 요청 실패:', error);
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
      console.log('🔄 FCM 토큰 갱신 시도');
      this.fcmToken = await generateFCMToken();
      
      if (this.fcmToken) {
        console.log('✅ FCM 토큰 갱신 성공');
      } else {
        console.log('❌ FCM 토큰 갱신 실패');
      }
      
      return this.fcmToken;
    } catch (error) {
      console.error('❌ FCM 토큰 갱신 중 오류:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
const fcmService = new FCMService();
export default fcmService;