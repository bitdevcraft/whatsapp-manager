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
};

export default nextConfig;
