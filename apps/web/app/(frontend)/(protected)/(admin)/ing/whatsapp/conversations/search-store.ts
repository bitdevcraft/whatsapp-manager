import { create } from "zustand";

// Define the shape of our search state
interface SearchState {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
}

// Create the Zustand store
export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
  clearQuery: () => set({ query: "" }),
}));
