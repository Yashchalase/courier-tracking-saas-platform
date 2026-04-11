import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
};

// @ducanh2912/next-pwa can pull Node-only code into the middleware bundle, which
// crashes on Vercel Edge (__dirname is not defined). Skip the wrapper on Vercel only;
// local dev/build behavior stays the same.
const isVercel = process.env.VERCEL === "1";

export default isVercel
  ? nextConfig
  : withPWAInit({
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
