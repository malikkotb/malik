// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: "raw-loader",
      exclude: /node_modules/,
    });

    return config;
  },
};

export default nextConfig;
