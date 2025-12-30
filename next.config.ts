import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: false, // disable double calls (dev only)
};

export default withFlowbiteReact(nextConfig);