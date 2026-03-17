import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { RestTimerProvider } from "@/components/workout/RestTimerProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import WorkoutHistory from "./pages/WorkoutHistory";
import Routines from "./pages/Routines";
import Evolution from "./pages/Evolution";
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
              <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/routines" element={<Routines />} />
                    <Route path="/history" element={<WorkoutHistory />} />
                    <Route path="/evolution" element={<Evolution />} />
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