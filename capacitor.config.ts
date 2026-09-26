import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.navinvenkatesan.exitkit',
  appName: 'ExitKit',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
