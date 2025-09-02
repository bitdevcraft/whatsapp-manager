import { create } from "zustand";

// Define the shape of our search state
interface SearchState {
  clearQuery: () => void;
  query: string;
  setQuery: (query: string) => void;
}

// Create the Zustand store
export const useSearchStore = create<SearchState>((set) => ({
  clearQuery: () => set({ query: "" }),
  query: "",
  setQuery: (query) => set({ query }),
}));
