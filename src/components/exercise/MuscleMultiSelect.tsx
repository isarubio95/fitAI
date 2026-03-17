import { useState, useMemo } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUPS, type MainMuscleGroup, type SpecificMuscle } from "@/constants/muscleGroups";

interface MuscleMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const MuscleMultiSelect = ({ value, onChange, placeholder = "Seleccionar músculos..." }: MuscleMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggle = (muscle: string) => {
    onChange(
      value.includes(muscle)
        ? value.filter((v) => v !== muscle)
        : [...value, muscle]
    );
  };

  const remove = (muscle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== muscle));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-11 font-normal"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value.map((m) => (
              <Badge key={m} variant="secondary" className="text-xs gap-1">
                {m}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => remove(m, e)}
                />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar músculo..." />
          <CommandList className="max-h-[250px]">
            <CommandEmpty>Sin resultados.</CommandEmpty>
            {(Object.entries(MUSCLE_GROUPS) as [MainMuscleGroup, readonly string[]][]).map(
              ([group, muscles]) => (
                <CommandGroup key={group} heading={group}>
                  {muscles.map((muscle) => (
                    <CommandItem
                      key={muscle}
                      value={muscle}
                      onSelect={() => toggle(muscle)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(muscle) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {muscle}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MuscleMultiSelect;
