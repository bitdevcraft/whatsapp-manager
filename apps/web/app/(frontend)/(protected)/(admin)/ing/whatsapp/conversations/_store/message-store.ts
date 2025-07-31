import { nanoid } from "nanoid";
import { create } from "zustand";

// Define the shape of our search state
interface SearchMessageIdState {
  searchString: string;
  searchMessageId: string;
  loading: boolean;
  searchRandomId: string;
  setSearchMessageId: (searchMessageId: string) => void;
  setSearchString: (searchString: string) => void;
  clearSearchMessageId: () => void;
  clearSearchString: () => void;
  setLoading: (loading: boolean) => void;
}

// Create the Zustand store
export const useSearchMessageStore = create<SearchMessageIdState>((set) => ({
  searchString: "",
  searchMessageId: "",
  loading: false,
  searchRandomId: "",
  setSearchMessageId: (searchMessageId) =>
    set(() => ({ searchMessageId, loading: true, searchRandomId: nanoid() })),
  setSearchString: (searchString) => set(() => ({ searchString })),
  clearSearchMessageId: () => set(() => ({ searchMessageId: "" })),
  clearSearchString: () => set(() => ({ searchString: "" })),
  setLoading: (loading) => set(() => ({ loading })),
}));
