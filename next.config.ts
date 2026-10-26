/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hrvhilxijhrblcgkrlrd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // Permite cualquier ruta de imagen dentro del almacenamiento público de Supabase
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '/**', // Permite cualquier ruta de imagen dentro del CDN de Discord
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
