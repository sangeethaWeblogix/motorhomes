/**
 * Response obfuscation for client-visible listing/filter API routes.
 *
 * This is NOT encryption — the key ships in the client bundle (it has to, or
 * the browser couldn't decode the response), so it only stops someone
 * casually reading the DevTools Network "Preview"/"Response" tab. It does not
 * stop a determined person from reading this file and reversing it.
 *
 * Isomorphic: uses only Web-standard globals (TextEncoder/TextDecoder,
 * atob/btoa) so it works in both the browser and Next.js route handlers.
 */

const OBF_KEY = "mfs-cfs-9f3a1c7e";

function xor(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    out[i] = bytes[i] ^ OBF_KEY.charCodeAt(i % OBF_KEY.length);
  }
  return out;
}

function bytesToBinaryString(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function binaryStringToBytes(s: string): Uint8Array {
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

export function encodeObfuscated(data: unknown): string {
  const json = JSON.stringify(data);
  const bytes = xor(new TextEncoder().encode(json));
  return btoa(bytesToBinaryString(bytes));
}

export function decodeObfuscated<T = any>(payload: string): T {
  const bytes = xor(binaryStringToBytes(atob(payload)));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Drop-in replacement for `res.ok ? res.json() : null` against an obfuscated route. */
export async function parseObfuscatedResponse<T = any>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    const text = await res.text();
    return decodeObfuscated<T>(text);
  } catch {
    return null;
  }
}

/** Drop-in replacement for `await req.json()` on a route whose client sent an obfuscated body. */
export async function readObfuscatedBody<T = any>(req: Request): Promise<T> {
  const text = await req.text();
  return decodeObfuscated<T>(text);
}
