import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const parsedApiBaseUrl = new URL(apiBaseUrl);
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: parsedApiBaseUrl.protocol.replace(":", "") as "http" | "https",
    hostname: parsedApiBaseUrl.hostname,
    port: parsedApiBaseUrl.port,
    pathname: "/uploads/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "5000",
    pathname: "/uploads/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "5000",
    pathname: "/uploads/**",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
