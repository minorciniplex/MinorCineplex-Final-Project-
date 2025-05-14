/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // 👈 Allow Cloudinary image URLs
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
