import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/*": index,
  },
  port: 3002,
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 User App running at ${server.url}`);

