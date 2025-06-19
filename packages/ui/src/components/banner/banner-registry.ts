import { ReactNode } from "react";

type RegistryItem = {
  content: ReactNode;
  type: "info" | "success" | "warning" | "error";
  config?: Partial<{
    dismissible: boolean;
    autoClose: boolean;
    duration: number;
  }>;
};

const registry = new Map<string, RegistryItem>();

export function registerBanner(persistId: string, item: RegistryItem) {
  registry.set(`banner:persist:${persistId}`, item);
}

export function getBannerById(persistId: string): RegistryItem | undefined {
  return registry.get(`banner:persist:${persistId}`);
}

export function getAllBannerPersistIds(): string[] {
  return [...registry.keys()];
}
