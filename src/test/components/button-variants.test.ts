import { describe, expect, it } from "vitest";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
const VARIANTS = [
  "default",
  "destructive",
  "outline",
  "filter",
  "secondary",
  "ghost",
  "link",
  "new",
] as const satisfies readonly ButtonVariant[];

function classes(
  opts?: Parameters<typeof buttonVariants>[0],
) {
  return cn(buttonVariants(opts ?? {}));
}

function heightUtils(className: string) {
  return className.split(/\s+/).filter((token) => /^(?:!)?(?:min-)?h-/.test(token));
}

describe("buttonVariants height", () => {
  it("la variante default no pelea con size: queda h-10", () => {
    const className = classes();
    expect(heightUtils(className)).toEqual(["h-10"]);
    expect(className).not.toMatch(/\bh-11\b/);
    expect(className).not.toMatch(/!h-/);
  });

  it("size lg es h-11 y no hace falta important", () => {
    const className = classes({ size: "lg" });
    expect(heightUtils(className)).toEqual(["h-11"]);
    expect(className).not.toMatch(/!h-/);
  });

  it("variant new gana h-9 por compoundVariants, sin !h-9", () => {
    const className = classes({ variant: "new" });
    expect(heightUtils(className)).toEqual(["h-9"]);
    expect(className).not.toMatch(/!h-/);
    expect(className).toMatch(/\brounded-full\b/);
    expect(className).not.toMatch(/\brounded-md\b/);
    expect(heightUtils(classes({ variant: "new", size: "lg" }))).toEqual(["h-9"]);
  });
});

describe("buttonVariants catalog", () => {
  it("no incluye la variante once ni hex esmeralda/stone", () => {
    true satisfies "once" extends ButtonVariant ? never : true;
    type Missing = Exclude<ButtonVariant, (typeof VARIANTS)[number]>;
    true satisfies [Missing] extends [never] ? true : never;

    for (const variant of VARIANTS) {
      expect(classes({ variant })).not.toMatch(/emerald|#d8f5e4|#6ee7b7|stone-/);
    }
  });
});
