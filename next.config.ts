import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
};

/**
 * Bundle analyzer, wired per the Soal 4 answer. Run `ANALYZE=true bun run build`
 * to open the size map and see which library dominates a route's bundle.
 */
const withAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
