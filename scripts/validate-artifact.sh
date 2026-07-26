#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

worker="${SITES_PROJECT_ROOT}/dist/server/index.js"
hosting="${SITES_PROJECT_ROOT}/dist/.openai/hosting.json"
wrangler="${SITES_PROJECT_ROOT}/dist/server/wrangler.json"
client="${SITES_PROJECT_ROOT}/dist/client"

[[ -f "${worker}" ]] || {
  echo "Missing Sites Worker entry: dist/server/index.js" >&2
  exit 66
}
[[ -f "${hosting}" ]] || {
  echo "Missing packaged Sites manifest: dist/.openai/hosting.json" >&2
  exit 66
}
[[ -f "${wrangler}" ]] || {
  echo "Missing Cloudflare deployment config: dist/server/wrangler.json" >&2
  exit 66
}
[[ -d "${client}" ]] || {
  echo "Missing Cloudflare static assets: dist/client" >&2
  exit 66
}

node --input-type=module - "${worker}" "${hosting}" "${wrangler}" <<'NODE'
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const [workerPath, hostingPath, wranglerPath] = process.argv.slice(2);
JSON.parse(await readFile(hostingPath, "utf8"));
const wrangler = JSON.parse(await readFile(wranglerPath, "utf8"));

if (wrangler.name !== "kalkulator-harga-shopee") {
  throw new Error("Generated Wrangler config has an unexpected Worker name");
}
if (wrangler.main !== "index.js") {
  throw new Error("Generated Wrangler config must deploy dist/server/index.js");
}
if (wrangler.assets?.directory !== "../client") {
  throw new Error("Generated Wrangler config must publish dist/client assets");
}
if (wrangler.assets?.binding !== "ASSETS") {
  throw new Error("Generated Wrangler config must expose the ASSETS binding");
}
if (!wrangler.compatibility_flags?.includes("nodejs_compat")) {
  throw new Error("Generated Wrangler config must enable nodejs_compat");
}

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("sites-validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);
if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error("dist/server/index.js must have an ESM default export with fetch(request, env, ctx)");
}
NODE

echo "Validated deployable Cloudflare Worker, static assets, Wrangler config, and Sites manifest."
