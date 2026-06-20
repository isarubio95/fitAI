import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitai.app',
  appName: 'Track Gym',
  webDir: 'dist',
  server: {
    url: 'https://trackgymnet.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
