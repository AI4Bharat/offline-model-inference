/** @type {import('next').NextConfig} */
import CopyPlugin from "copy-webpack-plugin";

const nextConfig = {
  images: {
    domains: ["ai4bharat.iitm.ac.in"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Enable WebAssembly support
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // Add CopyPlugin to the plugins array
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          // Copy all ONNX files from the root directory
          { from: "*.onnx", to: "static/model/[name][ext]" },
          { from: "*.vocab", to: "static/model/[name][ext]" },
        ],
      })
    );

    return config;
  },
};

export default nextConfig;
