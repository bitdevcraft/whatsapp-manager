import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const hostnames = ["lookaside.fbsbx.com", "scontent.whatsapp.net"];
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: join(__dirname, "../.."),
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
    remotePatterns: hostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
  trailingSlash: false,
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
