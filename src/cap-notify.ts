// src/cap-notify.ts
//@ts-nocheck
import {
  LocalNotifications,
  type PermissionStatus,
  type Channel,
  type ScheduleOptions,
} from '@capacitor/local-notifications';

const ANDROID_CHANNEL_ID_DEFAULT = 'pomodoro_end';
const ANDROID_CHANNEL_ID_CALLS = 'calls_channel';

const END_NOTIF_ID = 1001;

async function ensurePerms() {
  let perm: PermissionStatus = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') {
    perm = await LocalNotifications.requestPermissions();
  }
  return perm.display === 'granted';
}

async function createChannels() {
  // Канал для обычных уведомлений (оставим как был)
  const defaultChannel: Channel = {
    id: ANDROID_CHANNEL_ID_DEFAULT,
    name: 'General',
    description: 'Обычные уведомления',
    importance: 3,          // DEFAULT
    visibility: 1,          // PUBLIC
    vibration: true,
    lights: true,
    sound: 'default',
  };

  // Канал для звонков — высокий приоритет и звук
  const callsChannel: Channel = {
    id: ANDROID_CHANNEL_ID_CALLS,
    name: 'Calls',
    description: 'Входящие звонки и звонковые уведомления',
    importance: 5,          // HIGH
    visibility: 1,          // PUBLIC
    vibration: true,
    lights: true,
    sound: 'default',
  };

  await LocalNotifications.createChannel(defaultChannel);
  await LocalNotifications.createChannel(callsChannel);

  // Регистрируем действия (на будущее)
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'call_actions',
          actions: [
            { id: 'answer', title: 'Принять' },
            { id: 'decline', title: 'Отклонить', destructive: true }
          ]
        }
      ]
    });
  } catch {}
}

export async function initNotifications() {
  try {
    const ok = await ensurePerms();
    if (!ok) return;

    await createChannels();

    // Лисенеры (на будущее, можно прокидывать события в webview)
    LocalNotifications.addListener('localNotificationReceived', (n) => {
      // console.log('Received', n);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (a) => {
      // Можно переслать в загруженный web-клиент kamnefon через postMessage или сохранять в Preferences
      // const actionId = a.actionId; // 'answer' | 'decline'
      // const notif = a.notification;
    });
  } catch {
    // тихо игнорируем, если запущено в браузере
  }
}

export async function scheduleEndNotification(endAtMs: number, mode: 'focus'|'short'|'long') {
  try {
    const ok = await ensurePerms();
    if (!ok) return;

    const title = 'Сессия завершена';
    const body = mode === 'focus'
      ? 'Отличная работа! Время отдохнуть.'
      : 'Перерыв окончен. Вперёд к фокусу!';

    const opts: ScheduleOptions = {
      notifications: [{
        id: END_NOTIF_ID,
        title, body,
        schedule: { at: new Date(endAtMs) },
        smallIcon: 'ic_stat_icon',
        sound: 'default',
        channelId: ANDROID_CHANNEL_ID_DEFAULT,
      }]
    };

    await LocalNotifications.cancel({ notifications: [{ id: END_NOTIF_ID }] });
    await LocalNotifications.schedule(opts);
  } catch {}
}

export async function cancelEndNotification() {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: END_NOTIF_ID }] });
  } catch {}
}

export async function presentInstant(title: string, body: string) {
  try {
    const ok = await ensurePerms();
    if (!ok) return;

    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title,
        body,
        channelId: ANDROID_CHANNEL_ID_DEFAULT,
        smallIcon: 'ic_stat_icon',
        sound: 'default',
      }]
    });
  } catch {}
}

// Новое: "звонковое" уведомление с высоким приоритетом
export async function presentIncomingCall(title: string, body: string) {
  try {
    const ok = await ensurePerms();
    if (!ok) return;

    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now() & 0x7fffffff,
        title,
        body,
        channelId: ANDROID_CHANNEL_ID_CALLS,
        smallIcon: 'ic_stat_icon',
        sound: 'default',
        actionTypeId: 'call_actions',
        // Оставим возможность свайпнуть (autoCancel по умолчанию true).
        // Если нужно "не свайпается": ongoing: true
        // Android: high importance канала даст heads-up и звук даже на заблокированном экране.
      }]
    });
  } catch {}
}

// Экспорт в глобал для вызовов из HTML-оболочки
// @ts-ignore
(window).capNotify = {
  initNotifications,
  scheduleEndNotification,
  cancelEndNotification,
  presentInstant,
  presentIncomingCall,
};














// // src/cap-notify.ts
// import {
//    LocalNotifications,
//    type PermissionStatus,
//    type Channel,
//    type ScheduleOptions,
//  } from '@capacitor/local-notifications';
 
//  const ANDROID_CHANNEL_ID = 'pomodoro_end';
//  const END_NOTIF_ID = 1001;
 
//  async function ensurePerms() {
//    let perm: PermissionStatus = await LocalNotifications.checkPermissions();
//    if (perm.display !== 'granted') {
//      perm = await LocalNotifications.requestPermissions();
//    }
//  }
 
//  export async function initNotifications() {
//    try {
//      await ensurePerms();
//      const channel: Channel = {
//        id: ANDROID_CHANNEL_ID,
//        name: 'Pomodoro',
//        description: 'Уведомления по завершению таймера',
//        importance: 5,     // HIGH
//        visibility: 1,     // PUBLIC
//        vibration: true,
//        lights: true,
//        sound: 'default',
//      };
//      await LocalNotifications.createChannel(channel);
//    } catch {
//      // без паники, просто нет поддержки (например, при запуске в браузере)
//    }
//  }
 
//  export async function scheduleEndNotification(endAtMs: number, mode: 'focus'|'short'|'long') {
//    try {
//      await ensurePerms();
//      const title = 'Сессия завершена';
//      const body = mode === 'focus'
//        ? 'Отличная работа! Время отдохнуть.'
//        : 'Перерыв окончен. Вперёд к фокусу!';
//      const opts: ScheduleOptions = {
//        notifications: [{
//          id: END_NOTIF_ID,
//          title, body,
//          schedule: { at: new Date(endAtMs) },
//          smallIcon: 'ic_stat_icon',
//          sound: 'default',
//          channelId: ANDROID_CHANNEL_ID,
//        }]
//      };
//      await LocalNotifications.cancel({ notifications: [{ id: END_NOTIF_ID }] });
//      await LocalNotifications.schedule(opts);
//    } catch {
//      // игнор, если плагин недоступен
//    }
//  }
 
//  export async function cancelEndNotification() {
//    try {
//      await LocalNotifications.cancel({ notifications: [{ id: END_NOTIF_ID }] });
//    } catch {}
//  }
 
//  export async function presentInstant(title: string, body: string) {
//   try {
//     await ensurePerms();
//     await LocalNotifications.schedule({
//       notifications: [{
//         id: Date.now(),
//         title,
//         body,
//         channelId: ANDROID_CHANNEL_ID,   // добавили канал
//         smallIcon: 'ic_stat_icon',
//         sound: 'default',
//       }]
//     });
//   } catch {}
// }
 
//  // Экспортируем в глобал, чтобы вызывать из твоего inline-скрипта
//  // @ts-ignore
//  (window).capNotify = { initNotifications, scheduleEndNotification, cancelEndNotification, presentInstant };