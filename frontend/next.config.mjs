/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
};

// @ducanh2912/next-pwa is not used here: it pulled Node-only code into the Edge
// middleware bundle on Vercel (__dirname is not defined). Re-enable PWA later via
// a setup that does not wrap next.config (e.g. manual SW or a Vercel-safe plugin).
export default nextConfig;
