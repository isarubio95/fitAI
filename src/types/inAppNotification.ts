export type InAppNotificationKind = "info" | "action";

export interface InAppNotificationItem {
  id: string;
  kind: InAppNotificationKind;
  title: string;
  body?: string;
  /** Si false, no se oculta al descartar (p. ej. entreno en curso hasta que termine). */
  dismissable: boolean;
  accion?: { etiqueta: string; onClick: () => void };
}
