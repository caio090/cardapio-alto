import { defineConfig } from "vitest/config";
import path from "node:path";

const dirname = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // No parallel workers — this machine runs low on free RAM and
    // multiple V8 isolates spawning at once has crashed with an OOM here
    // before (same class of issue as `next build`'s worker pool). Not a
    // workaround for a code problem, purely local resource headroom.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
