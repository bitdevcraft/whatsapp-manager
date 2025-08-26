"use client";
import Head from "next/head";
import { createContext, ReactNode, useContext, useState } from "react";

// Context value now includes both title and setter
interface TitleContextValue {
  setTitle: (title: string) => void;
  title: string;
}

// Create context with default values
const TitleContext = createContext<TitleContextValue>({
  setTitle: () => {},
  title: "",
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
    <TitleContext.Provider value={{ setTitle, title }}>
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
