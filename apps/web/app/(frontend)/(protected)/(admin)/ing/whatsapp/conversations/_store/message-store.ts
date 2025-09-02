import { nanoid } from "nanoid";
import { create } from "zustand";

// Define the shape of our search state
interface SearchMessageIdState {
  clearSearchMessageId: () => void;
  clearSearchString: () => void;
  loading: boolean;
  searchMessageId: string;
  searchRandomId: string;
  searchString: string;
  setLoading: (loading: boolean) => void;
  setSearchMessageId: (searchMessageId: string) => void;
  setSearchString: (searchString: string) => void;
  updateRandomId: () => void;
}

// Create the Zustand store
export const useSearchMessageStore = create<SearchMessageIdState>((set) => ({
  clearSearchMessageId: () => set(() => ({ searchMessageId: "" })),
  clearSearchString: () => set(() => ({ searchString: "" })),
  loading: false,
  searchMessageId: "",
  searchRandomId: "",
  searchString: "",
  setLoading: (loading) => set(() => ({ loading })),
  setSearchMessageId: (searchMessageId) =>
    set(() => ({ loading: true, searchMessageId, searchRandomId: nanoid() })),
  setSearchString: (searchString) => set(() => ({ searchString })),
  updateRandomId: () => set(() => ({ searchRandomId: nanoid() })),
}));
