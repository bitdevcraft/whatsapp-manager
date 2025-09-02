import { create } from "zustand";

// Define the shape of our search state
interface SearchState {
  clearContactId: () => void;
  contactId: string;
  setContactId: (contactId: string) => void;
}

// Create the Zustand store
export const useContactStore = create<SearchState>((set) => ({
  clearContactId: () => set({ contactId: "" }),
  contactId: "",
  setContactId: (contactId) => set({ contactId }),
}));
