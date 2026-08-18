import { Switch } from "@/components/ui/switch";
import {
  COMMUNITY_PUBLISH_HINT_OFF,
  COMMUNITY_PUBLISH_HINT_ON,
} from "@/lib/communityFeedVisibility";

type PublishCommunitySwitchProps = {
  esPublica: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function PublishCommunitySwitch({ esPublica, onCheckedChange }: PublishCommunitySwitchProps) {
  return (
    <div className="col-span-2 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium">Publicar en comunidad</p>
        <p className="text-[12px] text-muted-foreground">
          {esPublica ? COMMUNITY_PUBLISH_HINT_ON : COMMUNITY_PUBLISH_HINT_OFF}
        </p>
      </div>
      <Switch checked={esPublica} onCheckedChange={onCheckedChange} aria-label="Publicar en comunidad" />
    </div>
  );
}
