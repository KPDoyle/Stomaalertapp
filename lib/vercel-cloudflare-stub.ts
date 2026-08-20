/**
 * Vercel does not expose Cloudflare Worker bindings. The client detects this
 * empty environment and switches to the device-local prototype data store.
 */
export const env: Record<string, never> = {};
