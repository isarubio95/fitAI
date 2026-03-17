import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";

interface ExerciseDBItem {
  id: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  equipment: string;
  instructions: string[];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AdminImport() {
  const [apiKey, setApiKey] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

  const handleImport = async () => {
    if (!apiKey.trim()) {
      toast({ title: "Error", description: "Introduce tu RapidAPI Key.", variant: "destructive" });
      return;
    }

    setImporting(true);
    setProgress(0);
    setLog([]);

    try {
      addLog("Fetching exercises from ExerciseDB...");

      const res = await fetch("https://exercisedb.p.rapidapi.com/exercises?limit=50&offset=0", {
        headers: {
          "X-RapidAPI-Key": apiKey.trim(),
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API error ${res.status}: ${body}`);
      }

      const data: ExerciseDBItem[] = await res.json();
      addLog(`Received ${data.length} exercises from API.`);

      const BATCH = 10;
      let imported = 0;

      for (let i = 0; i < data.length; i += BATCH) {
        const batch = data.slice(i, i + BATCH).map((ex) => ({
          external_id: ex.id,
          nombre: capitalize(ex.name),
          gif_url: ex.gifUrl,
          body_part: ex.bodyPart,
          equipment: ex.equipment,
          instructions: ex.instructions,
          imagen: ex.gifUrl,
        }));

        const { error } = await supabase
          .from("tipo_ejercicio")
          .upsert(batch as any, { onConflict: "external_id" });

        if (error) throw error;

        imported += batch.length;
        setProgress(Math.round((imported / data.length) * 100));
        addLog(`Imported ${imported}/${data.length} exercises...`);
      }

      toast({ title: "¡Importación completada!", description: `${imported} ejercicios importados correctamente.` });
      addLog("✅ Done!");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error en importación", description: err.message, variant: "destructive" });
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle asChild className="flex items-center gap-2">
            <h1>
              <Shield className="h-5 w-5" /> Admin Import
            </h1>
          </CardTitle>
          <CardDescription>
            Import exercises from ExerciseDB API into the catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="RapidAPI Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={importing}
          />
          <Button onClick={handleImport} disabled={importing} className="w-full">
            {importing ? <><Loader2 className="animate-spin mr-2" /> Importing...</> : "Start Import"}
          </Button>

          {importing && <Progress value={progress} className="w-full" />}

          {log.length > 0 && (
            <div className="bg-muted rounded-md p-3 max-h-48 overflow-y-auto text-xs font-mono space-y-1">
              {log.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
