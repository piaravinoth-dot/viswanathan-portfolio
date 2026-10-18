import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {portfolioSeo} from "./scripts/seo";
export default defineConfig({plugins:[react(),portfolioSeo()],server:{allowedHosts:["terminal.local"]}});
