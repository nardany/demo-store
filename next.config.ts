import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cPanel/VPS-ի համար՝ BUILD_STANDALONE=1 npm run build → .next/standalone/server.js
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  // SQLite բազան և վերբեռնված նկարները ներառում ենք build-ում (Vercel-ի ցուցադրական ռեժիմի համար)
  outputFileTracingIncludes: {
    "/**/*": ["./prisma/*.db", "./storage/uploads/**/*"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  // Արտաքին նկարները ցուցադրվում են առանց օպտիմալացման (տես isExternalImage),
  // դրա համար remotePatterns պետք չէ, և /_next/image-ը չի աշխատում որպես բաց պրոքսի
};

export default nextConfig;
