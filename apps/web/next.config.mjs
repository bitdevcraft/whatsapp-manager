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
  // experimental: {
  //   nodeMiddleware: true,
  // },
  // output: "standalone",
  async rewrites() {
    const REALTIME_SVC =
      process.env.REALTIME_SERVICE_URL ?? "http://localhost:3000";
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
