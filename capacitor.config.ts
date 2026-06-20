import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitai.app',
  appName: 'Track Gym',
  webDir: 'dist',
  android: {
    // Carga empaquetada en https://localhost — experiencia nativa, sin barra de Chrome.
    allowMixedContent: false,
  },
};

export default config;
