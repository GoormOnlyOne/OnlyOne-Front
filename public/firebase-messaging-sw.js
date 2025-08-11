// Firebase 메시징 서비스 워커
importScripts('https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js');

// Firebase 설정 - 환경변수에서 가져오기
// 주의: 이 설정은 .env 파일과 동기화되어야 합니다
const firebaseConfig = {
  apiKey: "AIzaSyBtmNNWYOo2Ei_tBDn2FNjTEA93rVg6LlU",
  authDomain: "buddkit-40bb2.firebaseapp.com",
  projectId: "buddkit-40bb2",
  storageBucket: "buddkit-40bb2.firebasestorage.app",
  messagingSenderId: "1073730325267",
  appId: "1:1073730325267:web:b08aa144950c40e7af68e6",
  measurementId: "G-9349WR6Q6W"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// FCM 메시징 인스턴스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('📱 백그라운드 FCM 메시지 수신:', payload);
  
  const notificationTitle = payload.notification?.title || '새 알림';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 메시지가 있습니다.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'fcm-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: '열기',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  // 백그라운드 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    // 알림 닫기
    return;
  }
  
  // 알림 클릭 시 앱으로 이동
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 열린 탭이 없으면 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  console.log('🔧 FCM 서비스 워커 설치됨');
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  console.log('✅ FCM 서비스 워커 활성화됨');
  event.waitUntil(self.clients.claim());
});