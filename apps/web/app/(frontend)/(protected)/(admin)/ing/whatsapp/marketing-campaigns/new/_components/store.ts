import { Template } from "@workspace/db";
import { create } from "zustand";

// Define the shape of our search state
interface SearchState {
  clearTemplate: () => void;
  setTemplate: (template: null | Template) => void;
  template: null | Template;
}

// Create the Zustand store
export const useTemplateStore = create<SearchState>((set) => ({
  clearTemplate: () => set({ template: null }),
  setTemplate: (template) => set({ template }),
  template: null,
}));
