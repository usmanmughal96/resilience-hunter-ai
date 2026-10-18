// Environment & HTTP helpers — works with free Google AI Studio / Vertex free tier
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env if present
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: resolve(root, '.env') });
} catch {}

export function env(key, fallback = '') {
  return process.env[key] || fallback;
}

export function hasKey(...keys) {
  return keys.every((k) => !!process.env[k]);
}

export async function http(url, options = {}) {
  const { timeout = 20000, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { ok: res.ok, status: res.status, body, headers: Object.fromEntries(res.headers) };
  } finally {
    clearTimeout(timer);
  }
}

export function loadJSON(relPath, fallback = null) {
  const p = resolve(root, relPath);
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, 'utf8'));
}

export const ROOT = root;
