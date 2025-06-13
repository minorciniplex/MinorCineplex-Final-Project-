/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["api.omise.co"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home-landing",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
