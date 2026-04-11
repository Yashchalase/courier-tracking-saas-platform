/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
};

// @ducanh2912/next-pwa was removed: it pulled Node-only code into the Edge
// middleware bundle on Vercel (__dirname is not defined).
export default nextConfig;
