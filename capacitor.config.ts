// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.tanki',
  appName: 'Tanki',
  webDir: 'dist',
 
  android: {
    allowMixedContent: true
  }
};

export default config;