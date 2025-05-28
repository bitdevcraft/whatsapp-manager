"use client";

import { useTitle } from "@/components/title-provider";
import { useEffect } from "react";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Ads Campaign");
  }, [setTitle]);

  return <></>;
}
