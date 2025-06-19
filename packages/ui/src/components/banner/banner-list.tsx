"use client";

import { useEffect, useState } from "react";
import {
  BannerData,
  subscribe,
  removeBanner,
  rehydrateBanners,
  clearPersistedBanner,
} from "./banner-store";
import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@workspace/ui/lib/utils";

const typeStyles: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 border-blue-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  error: "bg-red-100 text-red-800 border-red-300",
  success: "bg-green-100 text-green-800 border-green-300",
};

export function BannerList() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [closing, setClosing] = useState<Record<number, boolean>>({});

  useEffect(() => subscribe(setBanners), []);

  function handleClose(id: number) {
    const banner = banners.find((b) => b.id === id);
    if (!banner || closing[id]) return;

    // If it has persistId, remove from localStorage
    const persistId = banner.config.persistId;
    if (persistId) {
      clearPersistedBanner(persistId);
    }

    setClosing((prev) => ({ ...prev, [id]: true }));

    setTimeout(() => {
      removeBanner(id);
      setClosing((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }, 300);
  }

  useEffect(() => {
    banners.forEach((banner) => {
      if (banner.config.autoClose && !closing[banner.id]) {
        const timeout = setTimeout(
          () => handleClose(banner.id),
          banner.config.duration
        );
        return () => clearTimeout(timeout); // clean up if banner changes
      }
    });
  }, [banners, closing]);

  useEffect(() => {
    rehydrateBanners();
  }, []);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed top-4 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 space-y-2 px-4">
      {banners.map((banner) => {
        const isClosing = closing[banner.id];
        return (
          <div
            key={banner.id}
            className={cn(
              "w-full border px-4 py-2 text-sm flex items-center justify-between rounded shadow overflow-hidden transform transition-all duration-700 ease-in-out",
              closing[banner.id]
                ? "opacity-0 max-h-0 py-0 my-0 -translate-y-2"
                : "opacity-100 max-h-40 my-2 translate-y-0",
              typeStyles[banner.type]
            )}
          >
            <div className="flex-1 pr-1">{banner.content}</div>
            {banner.config.dismissible && (
              <button
                onClick={() => handleClose(banner.id)}
                className="ml-1 rounded p-1 transition hover:bg-opacity-20"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>,
    document.body
  );
}
