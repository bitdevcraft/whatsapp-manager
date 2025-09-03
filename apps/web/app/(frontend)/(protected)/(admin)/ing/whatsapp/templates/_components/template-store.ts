import { create } from "zustand";

// Define the shape of our search state
interface Store {
  isEditMode: boolean;
  setEditMode: (isEditMode: boolean) => void;
}

// Create the Zustand store
export const useTemplateStore = create<Store>((set) => ({
  isEditMode: false,
  setEditMode: (isEditMode) => set({ isEditMode }),
}));
