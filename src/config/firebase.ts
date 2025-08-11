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
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        return token;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

// 포그라운드 메시지 수신 처리
export const setupForegroundMessageListener = () => {
  onMessage(messaging, (payload) => {
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted') {
        new Notification(title || '알림', {
          body: body,
          icon: '/favicon.ico',
          tag: 'fcm-notification'
        });
      }
      
      // SSE와 연동하여 상태 업데이트
      window.dispatchEvent(new CustomEvent('notification-received', {
        detail: payload
      }));
    }
  });
};

export default app;