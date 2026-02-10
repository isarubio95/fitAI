import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Mail } from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Perfil</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <Button variant="destructive" className="w-full h-12" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
