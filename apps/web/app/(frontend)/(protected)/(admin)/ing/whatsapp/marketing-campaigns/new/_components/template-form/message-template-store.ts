import { create } from "zustand";

type Store = {
  preview: boolean;
  setPreview: (preview: boolean) => void;
};

export const usePreviewStore = create<Store>()((set) => ({
  preview: false,
  setPreview: (preview) => set(() => ({ preview })),
}));
