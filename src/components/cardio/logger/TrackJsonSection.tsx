import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/cardio/logger/FormField";
import { sectionCardClass } from "@/components/cardio/logger/constants";

type TrackJsonSectionProps = {
  trackJson: string;
  onTrackJsonChange: (value: string) => void;
};

export function TrackJsonSection({ trackJson, onTrackJsonChange }: TrackJsonSectionProps) {
  return (
    <div className={sectionCardClass}>
      <FormField id="cardio-track" label="Track GPS (JSON de puntos, opcional)">
        <Textarea
          id="cardio-track"
          value={trackJson}
          onChange={(e) => onTrackJsonChange(e.target.value)}
          placeholder='[{"lat":40.42,"lng":-3.70,"timestamp_utc":"2026-01-01T10:00:00Z"}]'
          className="min-h-28 font-mono text-xs"
        />
      </FormField>
    </div>
  );
}
