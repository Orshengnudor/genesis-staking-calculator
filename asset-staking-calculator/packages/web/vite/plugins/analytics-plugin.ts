import type { Plugin } from "vite";

export default function analyticsPlugin(): Plugin {
  return {
    name: "analytics-plugin",
    transformIndexHtml() {
      return [];
    },
  };
}
