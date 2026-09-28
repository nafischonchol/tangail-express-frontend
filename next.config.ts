import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@base-ui/react",
      "react-hot-toast",
    ],
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.mohimaa.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev.mohimaa.shop",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
