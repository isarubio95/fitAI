import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { LYFTA_API_KEY_URL } from "@/lib/lyfta/types";

export async function openLyftaApiKeyPage(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: LYFTA_API_KEY_URL });
    return;
  }
  window.open(LYFTA_API_KEY_URL, "_blank", "noopener,noreferrer");
}
