import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
};

// On Vercel, never load @ducanh2912/next-pwa (no static import). The plugin can pull
// Node-only code into the Edge middleware bundle → __dirname is not defined.
// Locally VERCEL is unset → PWA runs as before.
const onVercel = Boolean(process.env.VERCEL);

export default onVercel
  ? nextConfig
  : require("@ducanh2912/next-pwa").default({
      dest: "public",
      disable: process.env.NODE_ENV === "production",
      register: true,
      skipWaiting: true,
      fallbacks: {
        document: "/offline",
      },
      workboxOptions: {
        disableDevLogs: true,
      },
    })(nextConfig);
