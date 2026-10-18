/**
 * ResilienceHunter Agent Pipeline
 * INTENT → PLAN → MULTI-SOURCE DISCOVERY → DEDUP → ENRICH → IMPACT SCORE → BRIEF
 *
 * Uses Gemini (Google AI Studio free tier or Vertex AI) when key is present.
 * Fully functional in pure demo mode with zero keys.
 */

import { env, http, hasKey } from './env.mjs';
import { discoverSources, LIVE_SOURCES } from './sources.mjs';

// ---------- Intent parser ----------
const HAZARD_KEYWORDS = {
  flood: ['flood', 'flooding', 'inundation', 'riverine', 'flash flood'],
  heatwave: ['heat', 'heatwave', 'heat wave', 'extreme heat', 'hot'],
  drought: ['drought', 'dry', 'water scarcity', 'arid'],
  wildfire: ['wildfire', 'fire', 'bushfire', 'forest fire'],
  earthquake: ['earthquake', 'seismic', 'quake', 'tremor'],
  cyclone: ['cyclone', 'hurricane', 'typhoon', 'storm'],
  landslide: ['landslide', 'mudslide', 'slope'],
};

const CITY_COORDS = {
  karachi: { lat: 24.86, lon: 67.00, country: 'Pakistan' },
  lahore: { lat: 31.52, lon: 74.35, country: 'Pakistan' },
  islamabad: { lat: 33.68, lon: 73.04, country: 'Pakistan' },
  delhi: { lat: 28.61, lon: 77.20, country: 'India' },
  mumbai: { lat: 19.07, lon: 72.87, country: 'India' },
  jakarta: { lat: -6.20, lon: 106.84, country: 'Indonesia' },
  dhaka: { lat: 23.81, lon: 90.41, country: 'Bangladesh' },
  manila: { lat: 14.59, lon: 120.98, country: 'Philippines' },
  nairobi: { lat: -1.28, lon: 36.81, country: 'Kenya' },
  lagos: { lat: 6.52, lon: 3.37, country: 'Nigeria' },
  'mexico city': { lat: 19.43, lon: -99.13, country: 'Mexico' },
  'new york': { lat: 40.71, lon: -74.00, country: 'United States' },
  london: { lat: 51.50, lon: -0.12, country: 'United Kingdom' },
  tokyo: { lat: 35.67, lon: 139.65, country: 'Japan' },
  sydney: { lat: -33.86, lon: 151.20, country: 'Australia' },
};

export async function parseIntent(query, overrides = {}) {
  const q = (query || '').toLowerCase();
  let location = 'Global';
  let country = '';
  let lat = null, lon = null;

  for (const [city, meta] of Object.entries(CITY_COORDS)) {
    if (q.includes(city)) {
      location = city.replace(/\b\w/g, (c) => c.toUpperCase());
      country = meta.country;
      lat = meta.lat;
      lon = meta.lon;
      break;
    }
  }

  const hazards = [];
  for (const [hazard, kws] of Object.entries(HAZARD_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) hazards.push(hazard);
  }

  let intent = {
    query,
    location,
    country,
    lat,
    lon,
    hazards,
    focus: hazards.length ? hazards.join(', ') : 'multi-hazard resilience',
    parser: 'rules',
    ...overrides,
  };

  // Gemini (Google AI Studio free key or Vertex)
  const geminiKey = env('GEMINI_API_KEY') || env('GOOGLE_API_KEY');
  if (geminiKey) {
    try {
      const prompt = `You are an expert climate & disaster resilience analyst.
Extract structured intent from this user request. Return ONLY valid JSON with keys:
location (city or region), country, hazards (array of hazard types), focus (short phrase), lat (number or null), lon (number or null).
Request: "${query}"`;

      const r = await http(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 400 },
          }),
          timeout: 15000,
        }
      );

      if (r.ok) {
        const text = r.body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          intent = { ...intent, ...parsed, query, parser: 'gemini' };
        }
      }
    } catch (e) {
      console.warn('Gemini intent parse failed, using rules:', e.message);
    }
  }

  return intent;
}

// ---------- Planning ----------
export function buildPlan(intent) {
  const queries = [
    `Active ${intent.focus} alerts near ${intent.location}`,
    `Population vulnerability and critical infrastructure in ${intent.location}`,
    `Open funding and grant opportunities for climate resilience / disaster risk reduction`,
    `Local community capacity, NGOs and early-warning systems in ${intent.location}`,
    `Recent satellite and Earth Engine signals for ${intent.hazards.join(' or ') || 'hazards'}`,
  ];
  return queries;
}

// ---------- Impact scoring ----------
const SEVERITY_SCORE = { Red: 40, Orange: 28, Yellow: 15, Info: 5 };
const URGENCY_SCORE = { critical: 30, high: 22, medium: 12, low: 5 };

export function scoreOpportunity(item, intent) {
  let score = 0;
  const reasons = [];

  // Severity
  const sev = SEVERITY_SCORE[item.severity] || 10;
  score += sev;
  reasons.push(`Severity ${item.severity || 'unknown'} (+${sev})`);

  // Urgency
  const urg = URGENCY_SCORE[item.urgency] || 8;
  score += urg;
  reasons.push(`Urgency ${item.urgency || 'medium'} (+${urg})`);

  // Population at risk
  if (item.population_at_risk) {
    const popScore = Math.min(20, Math.log10(item.population_at_risk + 1) * 4);
    score += popScore;
    reasons.push(`Population exposure ~${item.population_at_risk.toLocaleString()} (+${popScore.toFixed(0)})`);
  }

  // Location relevance
  if (intent.location && intent.location !== 'Global') {
    const locMatch =
      (item.location || '').toLowerCase().includes(intent.location.toLowerCase()) ||
      (item.country || '').toLowerCase().includes((intent.country || '').toLowerCase());
    if (locMatch) {
      score += 15;
      reasons.push('Strong location match (+15)');
    }
  }

  // Hazard match
  if (intent.hazards?.length) {
    const hazardMatch = intent.hazards.some((h) =>
      (item.hazard || '').toLowerCase().includes(h.toLowerCase())
    );
    if (hazardMatch) {
      score += 12;
      reasons.push('Hazard type match (+12)');
    }
  }

  // Earth Engine signal bonus (novel)
  if (item.ee_signal) {
    score += 8;
    reasons.push('Earth Engine geospatial confirmation (+8)');
  }

  // Funding / community opportunity bonus
  if (item.opportunity_type?.toLowerCase().includes('funding') || item.opportunity_type?.toLowerCase().includes('partnership')) {
    score += 6;
    reasons.push('Actionable opportunity type (+6)');
  }

  // Cap and band
  score = Math.min(100, Math.round(score));
  let band = 'LOW';
  if (score >= 70) band = 'CRITICAL';
  else if (score >= 55) band = 'HIGH';
  else if (score >= 35) band = 'MEDIUM';

  return {
    score,
    band,
    reasons,
    why: reasons.slice(0, 3).join(' · '),
  };
}

// ---------- Deduplication ----------
function dedup(items) {
  const seen = new Map();
  const out = [];
  for (const it of items) {
    const key = `${(it.hazard || '').toLowerCase()}|${(it.location || '').toLowerCase().slice(0, 30)}|${(it.title || '').toLowerCase().slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.set(key, true);
    out.push(it);
  }
  return out;
}

// ---------- Gemini enrichment / briefing ----------
async function enrichWithGemini(opportunities, intent) {
  const geminiKey = env('GEMINI_API_KEY') || env('GOOGLE_API_KEY');
  if (!geminiKey || opportunities.length === 0) return opportunities;

  try {
    const top = opportunities.slice(0, 5);
    const summary = top.map((o, i) => `${i + 1}. [${o.band}] ${o.title} (${o.hazard}) – ${o.location}`).join('\n');

    const prompt = `You are a senior climate resilience advisor preparing a decision brief.
User focus: ${intent.query}
Location: ${intent.location}

Top ranked opportunities:
${summary}

For each, write one concise "recommended action" sentence (max 25 words) that a local government, NGO or funder could take in the next 48-72 hours.
Also write a 2-sentence overall situation summary.
Return JSON only: { "summary": "...", "actions": ["action1", "action2", ...] }`;

    const r = await http(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
        }),
        timeout: 20000,
      }
    );

    if (r.ok) {
      const text = r.body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return opportunities.map((o, i) => ({
          ...o,
          recommended_action: parsed.actions?.[i] || o.opportunity_type,
          situation_summary: i === 0 ? parsed.summary : undefined,
        }));
      }
    }
  } catch (e) {
    console.warn('Gemini enrichment skipped:', e.message);
  }
  return opportunities;
}

// ---------- Main agent runner ----------
export async function runAgent(query, options = {}, onEvent = () => {}) {
  const start = Date.now();
  const mode = options.mode || 'demo';

  onEvent({ type: 'step', text: 'Parsing intent with rules + Gemini (if available)…' });
  const intent = await parseIntent(query, options);
  onEvent({ type: 'intent', data: intent });

  onEvent({ type: 'step', text: `Focus: ${intent.focus} · Location: ${intent.location}` });
  const plan = buildPlan(intent);
  onEvent({ type: 'plan', queries: plan });
  onEvent({ type: 'step', text: `Planned ${plan.length} discovery axes` });

  onEvent({ type: 'step', text: 'Launching multi-source discovery (GDACS, USGS, Open-Meteo, Earth Engine, funding, community)…' });

  const raw = await discoverSources(intent, (src) => {
    onEvent({ type: 'source', ...src });
  });

  onEvent({ type: 'step', text: `Discovered ${raw.length} raw signals` });

  const unique = dedup(raw);
  onEvent({ type: 'step', text: `After deduplication: ${unique.length} unique opportunities` });

  // Score
  const scored = unique.map((item) => {
    const s = scoreOpportunity(item, intent);
    return {
      ...item,
      impact_score: s.score,
      band: s.band,
      why: s.why,
      score_reasons: s.reasons,
    };
  });

  scored.sort((a, b) => b.impact_score - a.impact_score);

  onEvent({ type: 'step', text: 'Running Gemini impact briefing & recommended actions…' });
  const enriched = await enrichWithGemini(scored, intent);

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  onEvent({ type: 'step', text: `Complete in ${duration}s · ${enriched.length} ranked opportunities` });

  return {
    intent,
    plan,
    opportunities: enriched,
    sources_used: LIVE_SOURCES.map((s) => s.id),
    duration_sec: parseFloat(duration),
    mode,
    generated_at: new Date().toISOString(),
  };
}
