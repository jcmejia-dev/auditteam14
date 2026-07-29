import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Image validation and the Storage bucket enforce 4 MB. The additional
      // room covers multipart boundaries while remaining below Vercel's
      // 4.5 MB Function request limit.
      bodySizeLimit: "4.25mb",
    },
  },
};

export default nextConfig;
