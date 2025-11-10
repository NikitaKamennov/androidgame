// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.novoznatel',
  appName: 'Знатель PRO',
  webDir: 'dist',
 
  android: {
    allowMixedContent: true
  }
};

export default config;