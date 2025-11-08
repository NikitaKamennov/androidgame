// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.tetris',
  appName: 'Tetris',
  webDir: 'dist',
 
  android: {
    allowMixedContent: true
  }
};

export default config;