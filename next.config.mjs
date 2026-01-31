/** @type {import("next").NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // output: "standalone",

  // async rewrites() {
  //   return [
  //     {
  //       source: "/backend/:path*",
  //       destination: "https://api.alifcarimport.com/:path*",
  //     },
  //   ];
  // },
 
}

export default nextConfig