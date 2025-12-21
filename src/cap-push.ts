// src/cap-push.ts
// @ts-nocheck
import { PushNotifications } from '@capacitor/push-notifications';

// Храним токен локально для повторной отправки в iframe
const LS_PUSH_TOKEN = 'kamnefon.pushToken';

let pushToken: string | null = null;

function saveToken(t: string) {
  pushToken = t;
  try { localStorage.setItem(LS_PUSH_TOKEN, t); } catch {}
  // Автосенд в iframe (если открыт)
  try { (window as any).__postToIframe?.({ type: 'push-token', token: t }); } catch {}
}

function loadToken() {
  if (pushToken) return pushToken;
  try { pushToken = localStorage.getItem(LS_PUSH_TOKEN); } catch {}
  return pushToken;
}

export async function initPush(): Promise<string | null> {
  try {
    // Запрос прав (Android 13+ покажет системный запрос)
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== 'granted') return null;
    }

    // Регистрация в FCM
    await PushNotifications.register();

    // Слушатели
    PushNotifications.addListener('registration', (token) => {
      saveToken(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.warn('Push registration error', err);
    });

    // Прилет пуша, когда приложение на экране (foreground)
    PushNotifications.addListener('pushNotificationReceived', async (notif) => {
      try {
        const data = notif.data || {};
        // Если прилетает «входящий звонок» — показываем «звонковое» локальное уведомление
        if (data.type === 'incoming-call') {
          const title = notif.title || data.title || 'Входящий звонок';
          const body = notif.body || data.body || (data.from ? `Звонит: ${data.from}` : 'Поступает вызов…');
          await (window as any).capNotify?.presentIncomingCall(title, body);
        } else {
          // Иначе обычное уведомление
          const title = notif.title || 'Уведомление';
          const body = notif.body || '';
          await (window as any).capNotify?.presentInstant(title, body);
        }
      } catch {}
    });

    // Действия по нажатию на уведомление (опционально)
    PushNotifications.addListener('pushNotificationActionPerformed', async (action) => {
      // Можно сфокусировать iframe/открыть нужный экран через postMessage
      try {
        (window as any).__postToIframe?.({ type: 'push-action', action });
      } catch {}
    });

    // Вернём уже сохранённый токен (если registration уже отработал)
    return loadToken();
  } catch (e) {
    console.warn('initPush error', e);
    return null;
  }
}

export function getPushToken(): string | null {
  return loadToken();
}

// Экспортируем в глобал для вызовов из wrapper
// @ts-ignore
(window).capPush = {
  initPush,
  getPushToken,
};