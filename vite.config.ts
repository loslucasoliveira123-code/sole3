// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [VitePWA({
    strategies: "generateSW",
    outDir: "dist/client",
    filename: "sw.js",
    manifest: false,
    injectRegister: null,
    registerType: "autoUpdate",
    devOptions: { enabled: false },
    includeAssets: ["offline.html", "manifest.webmanifest", "favicon.png", "icons/*.png"],
    workbox: {
      globPatterns: ["**/*.{js,css,woff,woff2,png,svg,webmanifest}", "offline.html"],
      globIgnores: ["**/server/**"],
      navigateFallback: null,
      navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth") && !url.pathname.startsWith("/api/"),
          handler: "NetworkFirst",
          options: {
            cacheName: "sole3-navigation",
            // Same-origin HTML is never opaque (status 0): do not persist
            // authenticated HTML, tokens, or embedded financial query data.
            cacheableResponse: { statuses: [0] },
            precacheFallback: { fallbackURL: "/offline.html" },
          },
        },
        {
          urlPattern: ({ url }) => url.origin === self.location.origin && /^\/assets\/.*-[\w-]{8,}\.(?:js|css|woff2?)$/.test(url.pathname),
          handler: "CacheFirst",
          options: { cacheName: "sole3-assets", expiration: { maxEntries: 100, maxAgeSeconds: 2592000 }, cacheableResponse: { statuses: [200] } },
        },
      ],
    },
  })],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
