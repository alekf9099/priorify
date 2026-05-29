self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || '오늘이 종료일입니다.', {
    body: data.body || '',
    icon: '/app-icon.png',
    badge: '/app-icon.png',
  });
});

// 매일 자정 마감 체크
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_CHECK') {
    checkDeadlines(e.data.cards);
  }
});

function checkDeadlines(cards) {
  const now = new Date();
  const todayStr = `${now.getMonth() + 1}/${now.getDate()}`;
  
  cards.forEach(card => {
    let endDate = null;
    if (card.date && card.date.includes('~')) {
      endDate = card.date.split('~')[1].trim();
    } else if (card.date) {
      endDate = card.date.trim();
    }
    
    if (endDate === todayStr) {
      self.registration.showNotification('오늘이 종료일입니다.', {
        body: card.text,
        icon: '/app-icon.png',
        badge: '/app-icon.png',
      });
    }
  });
}
