import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { RestTimerProvider } from "@/components/workout/RestTimerProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Library = lazy(() => import("./pages/Library"));
const Community = lazy(() => import("./pages/Community"));
const Evolution = lazy(() => import("./pages/Evolution"));
const CardioRoutines = lazy(() => import("./pages/CardioRoutines"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));
const Gyms = lazy(() => import("./pages/Gyms"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RestTimerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Analytics />
              <SpeedInsights />
              <BrowserRouter>
                <ScrollToTop />
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
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
