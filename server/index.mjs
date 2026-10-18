/**
 * ResilienceHunter API Server
 * Express-free pure Node HTTP server with SSE streaming
 * Deployable on Cloud Run (free tier) or any Node host
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.mjs';
import { runAgent } from './agent.mjs';
import { LIVE_SOURCES } from './sources.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(env('PORT', '8787'), 10);
const webDist = resolve(__dirname, '../web/dist');
const webPublic = resolve(__dirname, '../web');

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function sse(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  return send;
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  let path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  // Prefer built dist, fall back to source for dev
  let file = resolve(webDist, '.' + path);
  if (!existsSync(file)) file = resolve(webPublic, '.' + path);
  if (!existsSync(file) && path === '/index.html') {
    // Fallback inline HTML if web not built
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(FALLBACK_HTML);
    return true;
  }
  if (!existsSync(file) || !file.startsWith(webDist) && !file.startsWith(webPublic)) {
    return false;
  }
  try {
    const data = readFileSync(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ResilienceHunter AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0b1220; color: #e2e8f0; font-family: ui-sans-serif, system-ui; }
    .band-CRITICAL { background: rgba(239,68,68,0.15); color: #fca5a5; }
    .band-HIGH { background: rgba(249,115,22,0.15); color: #fdba74; }
    .band-MEDIUM { background: rgba(234,179,8,0.15); color: #fde047; }
    .band-LOW { background: rgba(100,116,139,0.15); color: #cbd5e1; }
  </style>
</head>
<body class="min-h-screen p-6">
  <div class="max-w-5xl mx-auto">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-emerald-400">◎ ResilienceHunter AI</h1>
      <p class="text-slate-400 mt-1">Climate & Disaster Resilience Opportunity Intelligence · AI Builder Cup 2026</p>
    </header>
    <div class="flex gap-3 mb-6">
      <input id="q" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
             value="Show highest-impact flood and heat resilience opportunities in Karachi and Sindh" />
      <button id="run" class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg">Run Agent</button>
    </div>
    <div id="steps" class="text-xs font-mono text-slate-400 space-y-1 mb-6 max-h-40 overflow-y-auto"></div>
    <div id="results" class="space-y-3"></div>
  </div>
  <script>
    const steps = document.getElementById('steps');
    const results = document.getElementById('results');
    document.getElementById('run').onclick = () => {
      steps.innerHTML = ''; results.innerHTML = '';
      const q = document.getElementById('q').value;
      const es = new EventSource('/api/run?q=' + encodeURIComponent(q) + '&mode=demo');
      es.addEventListener('step', e => {
        const d = JSON.parse(e.data);
        steps.innerHTML += '<div>→ ' + d.text + '</div>';
        steps.scrollTop = steps.scrollHeight;
      });
      es.addEventListener('result', e => {
        const data = JSON.parse(e.data);
        data.opportunities.forEach(o => {
          results.innerHTML += \`
            <div class="border border-slate-700 rounded-xl p-4 bg-slate-900/60">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="text-xs px-2 py-0.5 rounded band-\${o.band}">\${o.band}</span>
                  <span class="text-xs text-slate-500 ml-2">\${o.impact_score}/100</span>
                  <h3 class="font-semibold mt-1">\${o.title}</h3>
                  <p class="text-sm text-slate-400 mt-1">\${o.hazard} · \${o.location}</p>
                  <p class="text-sm mt-2 text-slate-300">\${o.why || o.description?.slice(0,160) || ''}</p>
                  \${o.recommended_action ? '<p class="text-sm mt-2 text-emerald-400">→ ' + o.recommended_action + '</p>' : ''}
                </div>
              </div>
            </div>\`;
        });
        es.close();
      });
      es.onerror = () => es.close();
    };
  </script>
</body>
</html>`;

const server = createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health
  if (url.pathname === '/api/health') {
    return sendJSON(res, 200, {
      status: 'ok',
      service: 'ResilienceHunter AI',
      version: '1.0.0',
      sources: LIVE_SOURCES.length,
      gemini: !!(env('GEMINI_API_KEY') || env('GOOGLE_API_KEY')),
      free_tier_ready: true,
      timestamp: new Date().toISOString(),
    });
  }

  // Sources catalogue
  if (url.pathname === '/api/sources') {
    return sendJSON(res, 200, { sources: LIVE_SOURCES });
  }

  // Main agent run (SSE)
  if (url.pathname === '/api/run') {
    const q = url.searchParams.get('q') || 'Show climate resilience opportunities';
    const mode = url.searchParams.get('mode') || 'demo';
    const location = url.searchParams.get('location') || undefined;
    const send = sse(res);

    try {
      const result = await runAgent(q, { mode, location }, (evt) => {
        if (evt.type === 'step') send('step', { text: evt.text });
        else if (evt.type === 'plan') send('plan', { queries: evt.queries });
        else if (evt.type === 'source') send('source', evt);
        else if (evt.type === 'intent') send('intent', evt.data);
      });
      send('result', result);
    } catch (err) {
      send('error', { message: err.message });
    }
    return res.end();
  }

  // Static / SPA
  if (serveStatic(req, res)) return;

  sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║          ◎  ResilienceHunter AI  ·  v1.0.0               ║
║     Climate & Disaster Resilience Opportunity Agent      ║
╠══════════════════════════════════════════════════════════╣
║  Local:     http://localhost:${PORT}                        ║
║  Health:    http://localhost:${PORT}/api/health             ║
║  Demo mode: works with ZERO API keys                     ║
║  Gemini:    set GEMINI_API_KEY for free Google AI Studio ║
╚══════════════════════════════════════════════════════════╝
`);
});
