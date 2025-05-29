/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/db",
    "@workspace/wa-cloud-api",
  ],
  allowedDevOrigins: [
    "centcapio.cc",
    "*.centcapio.cc",
    "facebook.com",
    "*.facebook.com",
  ],
};

export default nextConfig;
