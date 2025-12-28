import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaushik.sentra',
  appName: 'Sentra',
  webDir: 'public',
  server: {
    url: 'https://sentra-a2919.web.app',
    cleartext: false
  }
};

export default config;
