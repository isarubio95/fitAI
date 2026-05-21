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
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Community from "./pages/Community";
import WorkoutHistory from "./pages/WorkoutHistory";
import Evolution from "./pages/Evolution";
import CardioRoutines from "./pages/CardioRoutines";
import NotFound from "./pages/NotFound";
import AdminImport from "./pages/AdminImport";

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
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/routines" element={<Library />} />
                    <Route path="/exercises" element={<Navigate to="/routines?tab=ejercicios" replace />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/history" element={<WorkoutHistory />} />
                    <Route path="/evolution" element={<Evolution />} />
                    <Route path="/cardio-routines" element={<CardioRoutines />} />
                  </Route>
                  <Route path="/admin-import" element={<AdminImport />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RestTimerProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;