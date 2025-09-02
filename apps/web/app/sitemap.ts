import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [""].map((route) => ({
    lastModified: new Date().toISOString(),
    url: `${siteConfig.url}${route}`,
  }));

  return [...routes];
}
