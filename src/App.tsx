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
import Profile from "./pages/Profile";
import Routines from "./pages/Routines";
import NotFound from "./pages/NotFound";
import AdminImport from "./pages/AdminImport";
import ActiveWorkout from "./pages/ActiveWorkout";

const queryClient = new QueryClient();

const App = () => {
  // 1. Abrimos llaves para poder escribir código antes de pintar
  console.log("🔴 URL DE SUPABASE EN USO:", import.meta.env.VITE_SUPABASE_URL);

  // 2. Ahora hacemos el return explícito del JSX
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RestTimerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/exercises" element={<Exercises />} />
                  <Route path="/routines" element={<Routines />} />
                  <Route path="/history" element={<WorkoutHistory />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/workout/:id" element={<ActiveWorkout />} />
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