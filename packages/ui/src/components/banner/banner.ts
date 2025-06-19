import { ReactNode } from "react";
import { addBanner, BannerConfig } from "./banner-store";

export const banner = {
  info(content: ReactNode, config?: BannerConfig) {
    addBanner("info", content, config);
  },
  success(content: ReactNode, config?: BannerConfig) {
    addBanner("success", content, config);
  },
  warning(content: ReactNode, config?: BannerConfig) {
    addBanner("warning", content, config);
  },
  error(content: ReactNode, config?: BannerConfig) {
    addBanner("error", content, config);
  },
};
