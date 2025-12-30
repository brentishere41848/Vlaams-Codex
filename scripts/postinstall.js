/* eslint-disable no-console */

/**
 * VlaamsCodex npm wrapper - postinstall.
 *
 * This repository primarily ships the Python implementation.
 * The npm package historically had a postinstall hook, but in this repo it
 * must never hard-fail (CI / Vercel / offline installs).
 */

function main() {
  // Keep it a no-op to avoid breaking environments that run `npm install`
  // (e.g. Vercel). If we ever need real behavior, gate it behind an env var.
  if (process.env.VLAAMSCODEX_POSTINSTALL_VERBOSE === '1') {
    console.log('[vlaamscodex] postinstall: no-op');
  }
}

main();

