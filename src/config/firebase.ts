import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// FCM 메시징 초기화
export const messaging = getMessaging(app);

// FCM 토큰 발급
export const generateFCMToken = async (): Promise<string | null> => {
  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('🔔 알림 권한이 허용되었습니다.');
      
      // VAPID 키를 사용하여 토큰 발급
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        console.log('🔑 FCM 토큰 발급 성공:', token);
        return token;
      } else {
        console.log('❌ FCM 토큰 발급 실패: 토큰을 받을 수 없습니다.');
        return null;
      }
    } else {
      console.log('❌ 알림 권한이 거부되었습니다.');
      return null;
    }
  } catch (error) {
    console.error('❌ FCM 토큰 발급 중 오류:', error);
    return null;
  }
};

// 포그라운드 메시지 수신 처리
export const setupForegroundMessageListener = () => {
  onMessage(messaging, (payload) => {
    console.log('📱 포그라운드 FCM 메시지 수신:', payload);
    
    // 커스텀 알림 표시 또는 SSE와 연동
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted') {
        new Notification(title || '알림', {
          body: body,
          icon: '/favicon.ico', // 알림 아이콘
          tag: 'fcm-notification'
        });
      }
      
      // SSE와 연동하여 상태 업데이트 (통일된 이벤트명 사용)
      window.dispatchEvent(new CustomEvent('notification-received', {
        detail: payload
      }));
    }
  });
};

export default app;