/** @type {import("next").NextConfig} */
const nextConfig = {
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