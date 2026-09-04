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
    // El estilo real lo fija `applySystemBarsStyle` (src/hooks/useTheme.tsx) según
    // el tema de la app; aquí solo se deja explícito el contrato de insets, que
    // inyecta `--safe-area-inset-*` y lee `useSafeAreaInsetsSync`.
    SystemBars: {
      style: 'DEFAULT',
      insetsHandling: 'css',
    },
    // Sin `launchAutoHide: false` el splash se va en cuanto la Activity dibuja,
    // y el usuario ve fondo vacío → spinner de auth → spinner de perfil →
    // contenido. Lo mantenemos hasta que la app tiene algo real que enseñar y
    // lo oculta `useHideSplashWhenReady`.
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0C0C0B',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#22c55e',
    },
    BluetoothLe: {
      displayStrings: {
        scanning: 'Buscando sensores…',
        cancel: 'Cancelar',
        availableDevices: 'Sensores de pulsaciones',
        noDeviceFound: 'No se encontró ningún sensor',
      },
    },
  },
};

export default config;
