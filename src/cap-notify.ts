// src/cap-notify.ts
import {
   LocalNotifications,
   type PermissionStatus,
   type Channel,
   type ScheduleOptions,
 } from '@capacitor/local-notifications';
 
 const ANDROID_CHANNEL_ID = 'pomodoro_end';
 const END_NOTIF_ID = 1001;
 
 async function ensurePerms() {
   let perm: PermissionStatus = await LocalNotifications.checkPermissions();
   if (perm.display !== 'granted') {
     perm = await LocalNotifications.requestPermissions();
   }
 }
 
 export async function initNotifications() {
   try {
     await ensurePerms();
     const channel: Channel = {
       id: ANDROID_CHANNEL_ID,
       name: 'Pomodoro',
       description: 'Уведомления по завершению таймера',
       importance: 5,     // HIGH
       visibility: 1,     // PUBLIC
       vibration: true,
       lights: true,
       sound: 'default',
     };
     await LocalNotifications.createChannel(channel);
   } catch {
     // без паники, просто нет поддержки (например, при запуске в браузере)
   }
 }
 
 export async function scheduleEndNotification(endAtMs: number, mode: 'focus'|'short'|'long') {
   try {
     await ensurePerms();
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
         channelId: ANDROID_CHANNEL_ID,
       }]
     };
     await LocalNotifications.cancel({ notifications: [{ id: END_NOTIF_ID }] });
     await LocalNotifications.schedule(opts);
   } catch {
     // игнор, если плагин недоступен
   }
 }
 
 export async function cancelEndNotification() {
   try {
     await LocalNotifications.cancel({ notifications: [{ id: END_NOTIF_ID }] });
   } catch {}
 }
 
 export async function presentInstant(title: string, body: string) {
   try {
     await ensurePerms();
     await LocalNotifications.schedule({
       notifications: [{ id: Date.now(), title, body }]
     });
   } catch {}
 }
 
 // Экспортируем в глобал, чтобы вызывать из твоего inline-скрипта
 // @ts-ignore
 (window).capNotify = { initNotifications, scheduleEndNotification, cancelEndNotification, presentInstant };