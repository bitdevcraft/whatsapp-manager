import { ReactNode } from "react";
import { getBannerById, registerBanner } from "./banner-registry";

export type BannerType = "info" | "success" | "warning" | "error";
export interface BannerConfig {
  dismissible?: boolean;
  autoClose?: boolean;
  duration?: number;
  persistId?: string;
}

export interface BannerData {
  id: number;
  content: ReactNode;
  type: BannerType;
  config: Required<BannerConfig>;
}

const DEFAULT_CONFIG: Required<BannerConfig> = {
  dismissible: true,
  autoClose: true,
  duration: 5000,
  persistId: "",
};

let listeners: ((banners: BannerData[]) => void)[] = [];
let banners: BannerData[] = [];
let id = 0;

export function subscribe(fn: (banners: BannerData[]) => void) {
  listeners.push(fn);
  fn(banners);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function addBanner(
  type: BannerType,
  content: ReactNode,
  config?: BannerConfig
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  //   if (
  //     finalConfig.persistId &&
  //     localStorage.getItem(`banner:persist:${finalConfig.persistId}`)
  //   ) {
  //     return; // Skip if already shown
  //   }

  const newBanner: BannerData = {
    id: ++id,
    type,
    content,
    config: finalConfig,
  };

  banners = [...banners, newBanner];
  listeners.forEach((fn) => fn(banners));

  if (finalConfig.persistId) {
    localStorage.setItem(
      `banner:persist:${finalConfig.persistId}`,
      JSON.stringify({
        type,
        content: "", // Can't serialize JSX, so restore via `persistId` only
        config: finalConfig,
      })
    );

    registerBanner(finalConfig.persistId, {
      type,
      content,
      config,
    });
  }
}

export function removeBanner(id: number) {
  banners = banners.filter((b) => b.id !== id);
  listeners.forEach((fn) => fn(banners));
}

export function rehydrateBanners() {
  const entries = Object.entries(localStorage).filter(([key]) =>
    key.startsWith("banner:persist:")
  );

  for (const [key] of entries) {
    const persistId = key.replace("banner:persist:", "");
    const banner = getBannerById(persistId);

    if (!banner) continue;

    addBanner(banner.type, banner.content, {
      ...banner.config,
      persistId,
    });
  }
}
export function clearPersistedBanner(id: string) {
  localStorage.removeItem(`banner:persist:${id}`);
}
export function getPersistedBanner(id: string) {
  return localStorage.getItem(`banner:persist:${id}`);
}
