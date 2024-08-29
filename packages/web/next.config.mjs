/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3003/api/:path*',
      },
      {
        source: '/device/:path*',
        destination: 'http://localhost:3003/device/:path*',
      },
    ]
  },
}

export default nextConfig
