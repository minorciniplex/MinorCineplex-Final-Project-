/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home-landing',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 