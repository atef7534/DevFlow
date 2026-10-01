import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const env = { ...process.env };

// This Windows workspace blocks native SWC binaries. Webpack can use Next's
// matching WASM compiler, which is kept as a development dependency.
if (process.platform === "win32" && !env.NEXT_TEST_WASM_DIR) {
  env.NEXT_TEST_WASM_DIR = fileURLToPath(
    new URL("../node_modules/@next/swc-wasm-nodejs", import.meta.url),
  );
}

const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
