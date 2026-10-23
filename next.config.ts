import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "ldxwglwccnhdnvgwiiar.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
