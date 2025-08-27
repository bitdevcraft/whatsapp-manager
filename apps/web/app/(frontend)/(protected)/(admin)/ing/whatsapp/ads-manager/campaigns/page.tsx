"use client";

import { useEffect } from "react";

import { useTitle } from "@/components/provider/title-provider";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Ads Campaign");
  }, [setTitle]);

  return <></>;
}
