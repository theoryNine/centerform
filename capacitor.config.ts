import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.centerform",
  appName: "Centerform",
  webDir: "out",
  server: {
    // For development only — remove for production builds
    url: "http://localhost:3000",
    cleartext: true,
  },
};

export default config;
