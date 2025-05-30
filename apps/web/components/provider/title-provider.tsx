"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import Head from "next/head";

// Context value now includes both title and setter
interface TitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

// Create context with default values
const TitleContext = createContext<TitleContextValue>({
  title: "",
  setTitle: () => {},
});

interface TitleProviderProps {
  children: ReactNode;
  defaultTitle?: string;
}

export function TitleProvider({
  children,
  defaultTitle = "Default Site Title",
}: TitleProviderProps) {
  const [title, setTitle] = useState(defaultTitle);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      <Head>
        <title>{title}</title>
      </Head>
      {children}
    </TitleContext.Provider>
  );
}

// Hook to set the document and header title
export const useTitle = (): ((title: string) => void) => {
  return useContext(TitleContext).setTitle;
};

// Hook to read the current title
export const useCurrentTitle = (): string => {
  return useContext(TitleContext).title;
};
