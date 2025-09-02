import { nanoid } from "nanoid";
import { create } from "zustand";

import { ComponentValues } from "@/features/whatsapp/templates/lib/schema";

type Store = {
  components: (ComponentValues & { id: string })[];
  preview: boolean;
  setComponents: (components: ComponentValues[]) => void;
  setPreview: (preview: boolean) => void;
};

export const usePreviewStore = create<Store>()((set) => ({
  components: [],
  preview: false,

  setComponents: (components) =>
    set((state) => ({
      ...state,
      components: components.map((c) => ({ ...c, id: nanoid() })),
    })),
  setPreview: (preview) => set((state) => ({ ...state, preview })),
}));
