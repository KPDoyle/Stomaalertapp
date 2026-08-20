import { spawnSync } from "node:child_process";

const onVercel = process.env.VERCEL === "1";
const command = onVercel ? process.execPath : "bash";
const args = onVercel
  ? ["node_modules/next/dist/bin/next", "build"]
  : ["scripts/build-verified.sh"];

console.log(onVercel ? "Running Vercel Next.js build..." : "Running Sites build...");

const result = spawnSync(command, args, {
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
