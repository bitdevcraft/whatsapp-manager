"use client";

import { BannerList as UIBannerList } from "@workspace/ui/components/banner";
import { useState, useEffect } from "react";

export function ClientBannerList() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <UIBannerList />;
}
