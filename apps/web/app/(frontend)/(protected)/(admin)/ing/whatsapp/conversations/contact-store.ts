import { create } from "zustand";

// Define the shape of our search state
interface SearchState {
  contactId: string;
  setContactId: (contactId: string) => void;
  clearContactId: () => void;
}

// Create the Zustand store
export const useContactStore = create<SearchState>((set) => ({
  contactId: "",
  setContactId: (contactId) => set({ contactId }),
  clearContactId: () => set({ contactId: "" }),
}));
