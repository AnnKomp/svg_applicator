import { config } from 'dotenv';

config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    
    SECOND_POSTGRES_URL: process.env.SECOND_POSTGRES_URL,
    SECOND_POSTGRES_USER: process.env.SECOND_POSTGRES_USER,
    SECOND_POSTGRES_HOST: process.env.SECOND_POSTGRES_HOST,
    SECOND_POSTGRES_PASSWORD: process.env.SECOND_POSTGRES_PASSWORD,
    SECOND_POSTGRES_DATABASE: process.env.SECOND_POSTGRES_DATABASE,

  },
};

export default nextConfig;
