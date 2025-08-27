"use client";

import dynamic from "next/dynamic";

const BannerList = dynamic(
  () => import("@workspace/ui/components/banner").then(mod => mod.BannerList),
  { loading: () => null, ssr: false }
);

export function BannerArea() {
  return (
    <div className="px-1">
      <BannerList />
    </div>
  );
}
