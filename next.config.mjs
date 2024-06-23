/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    TECH_USER_USERNAME: process.env.TECH_USER_USERNAME,
    TECH_USER_PASSWORD: process.env.TECH_USER_PASSWORD,
  },
};

export default nextConfig;
