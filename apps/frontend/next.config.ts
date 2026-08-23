import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  
  allowedDevOrigins: [
    "10.78.77.121",
    "10.78.77.191",
  ],
};

export default nextConfig;
