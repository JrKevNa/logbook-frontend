const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  	reactStrictMode: false, // disable double calls (dev only)
};

module.exports = withFlowbiteReact(nextConfig);