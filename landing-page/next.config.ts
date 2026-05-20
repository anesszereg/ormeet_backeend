import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@ormeet/i18n"],
  turbopack: {
    root: path.resolve(__dirname, '..'),  
  },
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

export default withNextIntl(nextConfig);
