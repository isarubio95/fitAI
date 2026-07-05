import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trackgym.app',
  appName: 'Track Gym',
  webDir: 'dist',
  android: {
    // Carga empaquetada en https://localhost — experiencia nativa, sin barra de Chrome.
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#22c55e',
    },
  },
};

export default config;
