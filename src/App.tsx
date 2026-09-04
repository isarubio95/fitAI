import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { persistOptions } from "@/lib/queryPersistence";
import { queryClient } from "@/lib/queryClient";
import { Capacitor } from "@capacitor/core";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useHideSplashWhenReady } from "@/hooks/useHideSplashWhenReady";
import { ThemeProvider } from "@/hooks/useTheme";
import { RestTimerProvider } from "@/components/workout/RestTimerProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollManager } from "@/components/layout/ScrollManager";
import { usePressFeedback } from "@/hooks/usePressFeedback";
import { routeLoaders } from "@/lib/routePreload";
import type { ComponentType } from "react";

type PageLoader = () => Promise<{ default: ComponentType<unknown> }>;

// Comparten loader con `preloadRoute`, de modo que la precarga del pointerdown
// y el `lazy` acaben resolviendo el mismo módulo ya cacheado.
const Auth = lazy(routeLoaders["/auth"] as PageLoader);
const Dashboard = lazy(routeLoaders["/"] as PageLoader);
const Library = lazy(routeLoaders["/routines"] as PageLoader);
const Community = lazy(routeLoaders["/community"] as PageLoader);
const Evolution = lazy(routeLoaders["/evolution"] as PageLoader);
const CardioRoutines = lazy(routeLoaders["/cardio-routines"] as PageLoader);
const Gyms = lazy(routeLoaders["/gimnasios"] as PageLoader);

const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));

const isNative = Capacitor.isNativePlatform();

/**
 * Sin sesión no se pasa por AppLayout, así que el splash se ocultaría solo por
 * el tope de seguridad. Aquí se cierra en cuanto sabemos que la pantalla
 * definitiva es la de login. Ocultar el splash es idempotente.
 */
const SplashGate = () => {
  const { user, loading } = useAuth();
  useHideSplashWhenReady(!loading && !user);
  return null;
};

const App = () => {
  // En la raíz, no en AppLayout: la pantalla de auth también necesita feedback.
  usePressFeedback();

  return (
    <ThemeProvider>
      {/* Rehidrata la caché en disco antes del primer render: la app abre con
          el contenido de la última sesión y revalida por detrás. */}
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <AuthProvider>
          <SplashGate />
          <RestTimerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* Solo web: en el APK son scripts de Vercel que no sirven a nadie
                  y peticiones que fallan cuando no hay red. */}
              {!isNative && <Analytics />}
              {!isNative && <SpeedInsights />}
              <BrowserRouter>
                <ScrollManager />
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/privacidad" element={<PrivacyPolicy />} />
                    <Route path="/eliminar-cuenta" element={<DeleteAccount />} />
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/routines" element={<Library />} />
                      <Route path="/exercises" element={<Navigate to="/routines?tab=ejercicios" replace />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/history" element={<Navigate to="/evolution?tab=progress" replace />} />
                      <Route path="/evolution" element={<Evolution />} />
                      <Route path="/cardio-routines" element={<CardioRoutines />} />
                      <Route path="/gimnasios" element={<Gyms />} />
                      <Route path="/logros" element={<Navigate to="/" replace />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </RestTimerProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
