import path from "path";
import { fileURLToPath } from "url";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
  // Monorepo: correct serverless file tracing when Root Directory is `frontend`
  // and parent files are included (Vercel “include files outside root”).
  outputFileTracingRoot: path.join(frontendDir, ".."),
};

// @ducanh2912/next-pwa was removed: it pulled Node-only code into the Edge
// middleware bundle on Vercel (__dirname is not defined).
export default nextConfig;
