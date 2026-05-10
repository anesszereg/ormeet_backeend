import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Real event images can come from anywhere the backend exposes
    // (S3, Cloudinary, etc.). We allow any HTTPS host; tighten this in
    // production if needed.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
