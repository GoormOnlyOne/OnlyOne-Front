importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBtmNNWYOo2Ei_tBDn2FNjTEA93rVg6LlU",
  authDomain: "buddkit-40bb2.firebaseapp.com",
  projectId: "buddkit-40bb2",
  storageBucket: "buddkit-40bb2.firebasestorage.app",
  messagingSenderId: "1073730325267",
  appId: "1:1073730325267:web:b08aa144950c40e7af68e6",
  measurementId: "G-9349WR6Q6W"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  // 백엔드 리팩토링된 알림 타입에 따른 제목 설정
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'CHAT': return '새 메시지';
      case 'SETTLEMENT': return '정산 알림';
      case 'LIKE': return '좋아요';
      case 'COMMENT': return '새 댓글';
      default: return 'BuddKit 알림';
    }
  };

  const notificationType = payload.data?.type;
  const notificationTitle = payload.notification?.title || getNotificationTitle(notificationType);
  const notificationBody = payload.notification?.body || payload.data?.content || '새로운 알림이 도착했습니다.';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `buddkit-${notificationType || 'notification'}`,
    requireInteraction: false,
    data: {
      notificationId: payload.data?.notificationId,
      type: notificationType,
      url: payload.data?.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: '확인하기'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // 알림 데이터에서 URL 정보가 있으면 해당 페이지로, 없으면 메인 페이지로
    const targetUrl = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // 이미 열린 탭이 있으면 포커스
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // 열린 탭이 없으면 새 탭 생성
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});