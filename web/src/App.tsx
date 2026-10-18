import { useState, useEffect, useRef } from 'react';

type Band = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Tab = 'console' | 'opportunities' | 'map' | 'about';

interface Opp {
  id: string;
  title: string;
  hazard: string;
  severity?: string;
  location: string;
  country?: string;
  description?: string;
  source?: string;
  source_url?: string;
  impact_score: number;
  band: Band;
  why?: string;
  recommended_action?: string;
  situation_summary?: string;
  population_at_risk?: number;
  opportunity_type?: string;
  lat?: number;
  lon?: number;
  ee_signal?: boolean;
}

interface SourceEv {
  id: string;
  name: string;
  status: string;
  count?: number;
  error?: string;
}

const DEFAULT_Q = 'Show the highest-impact flood and heat resilience opportunities in Karachi and Sindh right now';

const bandStyle: Record<Band, string> = {
  CRITICAL: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30',
  HIGH: 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
  LOW: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
};

export default function App() {
  const [tab, setTab] = useState<Tab>('console');
  const [query, setQuery] = useState(DEFAULT_Q);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [sources, setSources] = useState<Record<string, SourceEv>>({});
  const [opps, setOpps] = useState<Opp[]>([]);
  const [selected, setSelected] = useState<Opp | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  function run() {
    esRef.current?.close();
    setRunning(true);
    setSteps([]);
    setPlan([]);
    setSources({});
    setOpps([]);
    setSelected(null);
    setSummary(null);
    setTab('console');
    setDuration(0);
    const t0 = Date.now();

    const p = new URLSearchParams({ q: query, mode: 'demo' });
    const es = new EventSource(`/api/run?${p}`);
    esRef.current = es;

    es.addEventListener('step', (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      setSteps((s) => [...s, d.text]);
    });
    es.addEventListener('plan', (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      setPlan(d.queries || []);
    });
    es.addEventListener('source', (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      setSources((s) => ({ ...s, [d.id]: d }));
    });
    es.addEventListener('result', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setOpps(data.opportunities || []);
      setDuration(data.duration_sec || (Date.now() - t0) / 1000);
      if (data.opportunities?.[0]?.situation_summary) {
        setSummary(data.opportunities[0].situation_summary);
      }
      setRunning(false);
      setTab('opportunities');
      es.close();
    });
    es.addEventListener('error', () => {
      setRunning(false);
      es.close();
    });
    es.onerror = () => {
      setRunning(false);
      es.close();
    };
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-panel/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">◎</div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight">ResilienceHunter AI</h1>
              <p className="text-xs text-slate-400">Climate & Disaster Opportunity Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {health && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                <span className={`w-1.5 h-1.5 rounded-full ${health.gemini ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {health.gemini ? 'Gemini live' : 'Demo mode (free)'}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              AI Builder Cup 2026
            </span>
          </div>
        </div>
      </header>

      {/* Query bar */}
      <div className="border-b border-slate-800 bg-panel/40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !running && run()}
              placeholder="e.g. Highest-impact heat & flood opportunities in Karachi…"
              disabled={running}
            />
            <button
              onClick={run}
              disabled={running}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition flex items-center gap-2"
            >
              {running ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running…
                </>
              ) : (
                'Run Agent'
              )}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Karachi flood & heat', 'Horn of Africa drought', 'Mediterranean wildfire', 'Jakarta flood resilience'].map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(`Show highest-impact resilience opportunities for: ${ex}`)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {(['console', 'opportunities', 'map', 'about'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm capitalize transition border-b-2 ${
                tab === t
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
              {t === 'opportunities' && opps.length > 0 && (
                <span className="ml-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                  {opps.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {tab === 'console' && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Agent Trace</h2>
              <div className="bg-panel border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-[420px] overflow-y-auto min-h-[200px]">
                {steps.length === 0 && !running && (
                  <p className="text-slate-500">Press “Run Agent” to start multi-source discovery…</p>
                )}
                {steps.map((s, i) => (
                  <div key={i} className="text-slate-300">
                    <span className="text-emerald-500/70">→</span> {s}
                  </div>
                ))}
                {running && (
                  <div className="text-emerald-400 animate-pulse">● discovering…</div>
                )}
              </div>
              {plan.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Discovery Plan</h2>
                  <ul className="space-y-1">
                    {plan.map((p, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-emerald-500/60">{i + 1}.</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Sources</h2>
              <div className="space-y-2">
                {Object.values(sources).length === 0 && (
                  <p className="text-sm text-slate-500">Waiting for source status…</p>
                )}
                {Object.values(sources).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-panel border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="text-slate-200">{s.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === 'ok'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : s.status === 'demo'
                          ? 'bg-sky-500/15 text-sky-400'
                          : s.status === 'running'
                          ? 'bg-amber-500/15 text-amber-400'
                          : s.status === 'error'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {s.status}
                      {s.count != null ? ` · ${s.count}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'opportunities' && (
          <div className="space-y-4">
            {summary && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <h3 className="text-sm font-medium text-emerald-400 mb-1">Situation Brief (Gemini)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
              </div>
            )}
            {opps.length === 0 && !running && (
              <div className="text-center py-16 text-slate-500">
                <p className="text-lg">No opportunities yet</p>
                <p className="text-sm mt-1">Run the agent to discover ranked resilience opportunities</p>
              </div>
            )}
            <div className="grid gap-3">
              {opps.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`border rounded-xl p-4 cursor-pointer transition hover:border-emerald-500/40 ${
                    selected?.id === o.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 bg-panel'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bandStyle[o.band]}`}>
                          {o.band}
                        </span>
                        <span className="text-xs text-slate-500">{o.impact_score}/100</span>
                        {o.ee_signal && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300">
                            Earth Engine
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{o.hazard}</span>
                      </div>
                      <h3 className="font-medium mt-1.5 text-slate-100">{o.title}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {o.location}
                        {o.population_at_risk
                          ? ` · ~${o.population_at_risk.toLocaleString()} people at risk`
                          : ''}
                      </p>
                      <p className="text-sm text-slate-300 mt-2 line-clamp-2">{o.why || o.description}</p>
                      {o.recommended_action && (
                        <p className="text-sm text-emerald-400 mt-2 flex gap-1.5">
                          <span className="shrink-0">→</span>
                          <span>{o.recommended_action}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-semibold text-slate-200">{o.impact_score}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">Impact</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {duration > 0 && (
              <p className="text-xs text-slate-500 text-center pt-2">
                Completed in {duration}s · {opps.length} opportunities ranked
              </p>
            )}
          </div>
        )}

        {tab === 'map' && (
          <div className="space-y-4">
            <div className="bg-panel border border-slate-800 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-4">
                Interactive map view (Leaflet / Google Maps) can be enabled with a free Mapbox or Google Maps key.
                Below is a coordinate list of discovered opportunities.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                {opps
                  .filter((o) => o.lat && o.lon)
                  .map((o) => (
                    <div key={o.id} className="bg-slate-900/60 border border-slate-700 rounded-lg p-3 text-sm">
                      <div className={`text-xs mb-1 px-1.5 py-0.5 rounded inline-block ${bandStyle[o.band]}`}>
                        {o.band}
                      </div>
                      <div className="font-medium truncate">{o.title}</div>
                      <div className="text-slate-400 text-xs mt-1">
                        {o.lat?.toFixed(2)}, {o.lon?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                {opps.filter((o) => o.lat && o.lon).length === 0 && (
                  <p className="text-slate-500 col-span-full">Run the agent to populate geo-located opportunities.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'about' && (
          <div className="prose prose-invert prose-sm max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-emerald-400 mb-2">What is ResilienceHunter?</h2>
              <p className="text-slate-300 leading-relaxed">
                ResilienceHunter is an AI agent that continuously scans the world’s open climate, disaster,
                satellite and community datasets to surface the <strong>highest-impact opportunities for action</strong> —
                before they become obvious. It turns fragmented signals into ranked, actionable resilience opportunities
                with recommended next steps.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-200">What makes it different</h3>
              <ul className="text-slate-300 space-y-1 list-disc pl-5">
                <li>Multi-source agentic discovery (GDACS, USGS, Open-Meteo, NASA FIRMS, funding, community capacity)</li>
                <li>Google Earth Engine geospatial signals fused with human-readable alerts</li>
                <li>Gemini reasoning for intent understanding + situation briefs + recommended actions</li>
                <li>Impact scoring that balances severity, urgency, population exposure and actionability</li>
                <li>Works fully offline in demo mode — zero API keys required to evaluate</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Google Cloud services used (free tiers)</h3>
              <ul className="text-slate-300 space-y-1 list-disc pl-5">
                <li><strong>Gemini</strong> (Google AI Studio free tier or Vertex AI free credits) – reasoning & briefs</li>
                <li><strong>Earth Engine</strong> – flood, heat, vegetation stress signals (free research accounts)</li>
                <li><strong>BigQuery</strong> – optional historical analytics (1 TB free / month)</li>
                <li><strong>Cloud Run</strong> – serverless deployment (2 M requests free / month)</li>
                <li><strong>Cloud Storage</strong> – datasets & imagery (5 GB free)</li>
                <li><strong>Pub/Sub</strong> – event-driven alerts (10 GB free / month)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Built for AI Builder Cup 2026</h3>
              <p className="text-slate-300">
                Addresses the challenge of improving resource efficiency, strengthening resilience and enabling
                informed sustainable decision-making through climate & disaster intelligence.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-30 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-md bg-panel border-l border-slate-800 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bandStyle[selected.band]}`}>
              {selected.band} · {selected.impact_score}/100
            </span>
            <h2 className="text-xl font-semibold mt-3">{selected.title}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {selected.hazard} · {selected.location}
            </p>
            {selected.description && (
              <p className="text-sm text-slate-300 mt-4 leading-relaxed">{selected.description}</p>
            )}
            {selected.why && (
              <div className="mt-4">
                <h4 className="text-xs uppercase tracking-wider text-slate-500">Why this ranks high</h4>
                <p className="text-sm text-slate-300 mt-1">{selected.why}</p>
              </div>
            )}
            {selected.recommended_action && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="text-xs uppercase tracking-wider text-emerald-400">Recommended action</h4>
                <p className="text-sm text-slate-200 mt-1">{selected.recommended_action}</p>
              </div>
            )}
            {selected.population_at_risk && (
              <p className="text-sm text-slate-400 mt-4">
                Est. population at risk: <strong className="text-slate-200">{selected.population_at_risk.toLocaleString()}</strong>
              </p>
            )}
            {selected.source_url && (
              <a
                href={selected.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-6 text-sm text-emerald-400 hover:underline"
              >
                View source →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
