# ◎ ResilienceHunter AI

### Climate & Disaster Resilience Opportunity Intelligence
**AI Builder Cup 2026 Entry**

> An AI agent that scans the world’s open climate, disaster, satellite and community signals to surface the **highest-impact opportunities for action** — ranked, explained, and ready for decision-makers.

![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933?logo=nodedotjs&logoColor=white)
![Demo](https://img.shields.io/badge/Demo_mode-zero_keys_required-10b981)
![Gemini](https://img.shields.io/badge/Gemini-Google_AI_Studio_free-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Why this exists

Climate and disaster risks are rising, but the signals that could trigger timely action are fragmented across dozens of feeds, satellite products, funding databases and local capacity maps.  

**ResilienceHunter** turns that fragmentation into ranked, actionable **resilience opportunities**.

It answers questions like:

- “What are the highest-impact flood and heat interventions needed in Karachi / Sindh *right now*?”
- “Where is drought risk colliding with weak early-warning capacity and open funding?”
- “Which communities have the biggest gap between hazard exposure and local response capacity?”

---

## What it does (the cool, previously rare parts)

| Capability | How it works | Why it is novel |
|------------|--------------|-----------------|
| **Multi-source agentic discovery** | Parallel queries to GDACS, USGS, Open-Meteo, NASA FIRMS style signals, funding calls, community capacity | Most tools show one feed; this agent *fuses* them |
| **Earth Engine geospatial confirmation** | Surface-water anomaly + land-surface temperature signals fused with human alerts | Satellite evidence attached to every high-priority opportunity |
| **Gemini reasoning layer** | Intent parsing + situation brief + 48-72 h recommended actions | Turns raw alerts into decision-ready language |
| **Impact scoring** | Severity × Urgency × Population × Location match × Actionability | Not just “latest news” — prioritised by potential impact |
| **Zero-key demo mode** | Full end-to-end experience without any API keys | Judges can run it instantly |
| **Cloud-native free tier path** | Designed for Gemini free tier, Earth Engine research accounts, Cloud Run free tier, BigQuery free tier | Can be hosted on Google Cloud with $0 spend for demos |

---

## Quick Start (Local – 30 seconds)

```bash
# 1. Unzip / clone
cd resilience-hunter-ai

# 2. Install
npm install

# 3. Run
npm start
# → http://localhost:8787
```

Open the browser → click **Run Agent**.  
Works in pure demo mode — **no API keys required**.

### Optional: enable free Gemini reasoning

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API key (free).
2. Copy `.env.example` → `.env` and add:
```env
GEMINI_API_KEY=your_free_key_here
```
3. Restart. Gemini now powers intent + action briefs.

---

## Deploy Free on Google Cloud (Cloud Run) — What judges want

Judges expect a **live public URL**. Here is the fastest free method:

### 1. Get free Gemini key (30 sec)
https://aistudio.google.com/app/apikey → Create API key

### 2. One-command deploy to Cloud Run

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

gcloud run deploy resilience-hunter \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=AIzaYourFreeKeyHere" \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3
```

After ~3 minutes you receive a public URL:

```
https://resilience-hunter-xxxxx-uc.a.run.app
```

**Submit that live link.**

- Scales to zero when idle → **$0 cost**
- Uses the exact Google services the challenge recommends (Cloud Run + Gemini)
- Full detailed guide (billing tips, troubleshooting, optional BigQuery / Earth Engine / Pub/Sub):  
  **`docs/DEPLOY_GOOGLE_CLOUD_FREE.md`**

---

## Architecture

```
User query
    │
    ▼
┌──────────────────┐
│  Intent Parser   │  Rules + Gemini (free)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Discovery Plan  │  Multi-axis search plan
└────────┬─────────┘
         ▼
┌──────────────────────────────────────────────┐
│           Parallel Source Agents             │
│  GDACS · USGS · Open-Meteo · Funding         │
│  Community capacity · Earth Engine signals   │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────┐
│  Dedup + Score   │  Impact score (0-100)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Gemini Briefing  │  Situation summary + actions
└────────┬─────────┘
         ▼
   Ranked Opportunities
   (CRITICAL / HIGH / MEDIUM / LOW)
```

---

## Google Cloud / Free services used

| Service | Purpose | Free tier / how to get it |
|---------|---------|---------------------------|
| **Gemini (Google AI Studio)** | Intent + reasoning + briefs | Completely free key at aistudio.google.com |
| **Google Earth Engine** | Flood / heat / vegetation stress signals | Free research / non-commercial accounts |
| **BigQuery** | Optional historical climate analytics | 1 TB queries / month free |
| **Cloud Run** | Host the agent | 2 million requests / month free |
| **Cloud Storage** | Datasets & imagery | 5 GB free |
| **Pub/Sub** | Future real-time alert fan-out | 10 GB / month free |

**No paid Google Cloud account is required** to evaluate or demo this solution.  
A free Google AI Studio key is enough for the most impressive features.

---

## Running the full UI (optional)

```bash
# Terminal 1 – API
npm start

# Terminal 2 – React UI (hot reload)
cd web
npm install
npm run dev
# → http://localhost:5173  (proxies /api to :8787)
```

Or build the UI into the server:

```bash
cd web && npm install && npm run build
cd .. && npm start
# Everything served from http://localhost:8787
```

---

## Headless demo (great for videos / judges)

```bash
node server/demo.mjs "Show highest-impact heat and flood opportunities in Karachi"
```

---

## Tests

```bash
npm test
```

All tests run without any external keys.

---

## Project structure

```
resilience-hunter-ai/
├── server/
│   ├── index.mjs          # HTTP + SSE server (Cloud Run ready)
│   ├── agent.mjs          # Core agent pipeline
│   ├── sources.mjs        # Live + demo data sources
│   ├── env.mjs            # Config helpers
│   └── demo.mjs           # CLI demo runner
├── web/                   # React + Vite frontend
├── tests/
├── .env.example
├── package.json
└── README.md
```

---

## Example output (demo mode)

```
◎ ResilienceHunter AI – Live Demo Run
Query: Show the highest-impact flood and heatwave resilience opportunities for Karachi and Sindh

→ Parsing intent …
→ Focus: flood, heatwave · Location: Karachi
→ Launching multi-source discovery …
   [demo] GDACS Global Disaster Alerts (5)
   [ok]   USGS Earthquake Hazards (3)
   [demo] Open-Meteo Extreme Weather (1)
   [demo] Resilience Funding & Grants (3)
   [demo] Local Capacity & Community Signals (3)
   [demo] Google Earth Engine Signals (2)
→ After deduplication: 12 unique opportunities
→ Running Gemini impact briefing …

1. [CRITICAL 92] Extreme Heat Wave – Northern India & Pakistan
   Action: Activate heat action plan, open cooling centres, target vulnerable neighbourhoods within 48 h.

2. [HIGH 78] Flood Alert – Indus River Basin (Pakistan)
   Action: Pre-position relief stocks and activate community early-warning groups in Sindh.

3. [HIGH 71] Elevated Flood Risk Index – Target Region (Earth Engine)
   …
```

---

## Roadmap (post-submission)

- [ ] Full Earth Engine authenticated queries (service account)
- [ ] BigQuery materialised views of historical hazard frequency
- [ ] Pub/Sub → Cloud Run alert fan-out to Telegram / email
- [ ] Multi-language briefs (Urdu, Hindi, Bahasa, etc.)
- [ ] Community contribution portal for local capacity updates

---

## Privacy & responsible use

- Only public, open data sources are queried.
- No personal data is collected or stored.
- Recommended actions are advisory; local authorities remain the decision makers.
- Satellite and model outputs carry uncertainty — always cross-check with official sources.

---

## License

MIT

---

**ResilienceHunter doesn’t just show you the next disaster.**  
**It shows you the highest-leverage opportunities to reduce its impact.**
