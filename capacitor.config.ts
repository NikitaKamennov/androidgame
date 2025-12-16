/// <reference types="@capacitor/local-notifications" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kamnefon.app',
  appName: 'Kamnefon',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'kamnefon.ru',
      '*.kamnefon.ru'
    ]
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',   // положи иконку в android/app/src/main/res/drawable/
      iconColor: '#2196F3',
      sound: 'beep.wav'            // опционально, положи в android/app/src/main/res/raw/beep.wav
    }
  }
};

export default config;