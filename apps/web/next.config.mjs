import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/db",
    "@workspace/shared",
    "@workspace/wa-cloud-api",
  ],
  allowedDevOrigins: [
    "centcapio.cc",
    "*.centcapio.cc",
    "facebook.com",
    "*.facebook.com",
  ],
  images: {
    remotePatterns: [new URL("https://lookaside.fbsbx.com/*")],
  },
  // experimental: {
  //   nodeMiddleware: true,
  // },
  // output: "standalone",
  async rewrites() {
    const REALTIME_SVC = process.env.WEB_SOCKET ?? "http://localhost:3000";
    return [
      // → all Socket.IO traffic
      {
        source: "/socket.io/:path*",
        destination: `${REALTIME_SVC}/socket.io/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
