# Using Free Google Services with ResilienceHunter

This document explains exactly how to leverage the Google Cloud technologies recommended by the AI Builder Cup **without spending money**.

---

## 1. Gemini on Vertex AI / Google AI Studio (Reasoning)

**Best free path for the competition: Google AI Studio**

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with any Google account
3. Click “Create API key”
4. Copy the key into your `.env`:

```env
GEMINI_API_KEY=AIza...
```

**What you get for free**
- Gemini 2.0 Flash / 1.5 Flash / 1.5 Pro
- Generous rate limits suitable for demos and judging
- No credit card required

**How ResilienceHunter uses it**
- Intent understanding (city, hazards, focus)
- Situation summary generation
- 48–72 hour recommended actions for each high-impact opportunity

**Vertex AI alternative** (if you already have a GCP project with free credits)
- Enable Vertex AI API
- Use the same Gemini models via the Vertex endpoint
- The code already falls back gracefully if the key is missing

---

## 2. Google Earth Engine (Geospatial & Environmental Analysis)

1. Go to https://earthengine.google.com/
2. Register for a free (non-commercial / research) account
3. Once approved, you can run the Code Editor and create service accounts

**In the current solution**
- Earth Engine signals are simulated with realistic placeholders so the demo works offline
- The architecture is ready for real EE queries (flood probability, LST anomaly, NDVI stress)

**Cool things you can add later (still free)**
- Daily surface-water anomaly layers
- Land-surface temperature heat islands
- Vegetation health (drought early warning)
- Night-time lights as a proxy for power outage after disasters

---

## 3. BigQuery (Large environmental / social datasets)

**Free tier**
- 1 TB of query processing per month
- 10 GB of storage

**Suggested use**
- Historical disaster event tables
- Population vulnerability layers
- Climate indicator time series

You can load open datasets (e.g. EM-DAT style, WorldPop, climate indices) into a free BigQuery dataset and query them from the agent.

---

## 4. Cloud Run (Deploy the application)

**Free tier (as of 2025/2026)**
- 2 million requests / month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

**Deploy steps (once you have a free GCP project)**

```bash
# Build a container (or use the Node source)
gcloud run deploy resilience-hunter \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

The server in `server/index.mjs` is already Cloud Run ready (listens on `PORT`, pure Node, no extra process managers).

---

## 5. Cloud Storage

**Free tier**: 5 GB-months

Use it for:
- Satellite imagery or Earth Engine exports
- Cached report PDFs
- Static map tiles if needed

---

## 6. Pub/Sub (Event-driven alerts)

**Free tier**: 10 GB of messages / month

Future enhancement already architected:
- When a new CRITICAL opportunity is scored, publish to a topic
- Downstream Cloud Run or Cloud Functions can push Telegram / email / SMS alerts to registered responders

---

## 7. Vision AI (optional)

Useful for:
- Damage assessment from post-disaster satellite or drone imagery
- Detecting informal settlements in flood plains

Free trial credits are usually available when you enable the API.

---

## Recommended “$0 to live demo” path

1. Clone / unzip this repo
2. `npm install && npm start` → works offline
3. Add free Gemini key from AI Studio → instant reasoning upgrade
4. (Optional) Create free GCP project → enable Cloud Run → deploy
5. (Optional) Register for free Earth Engine account → replace demo EE signals with live ones

This combination gives you a fully working, Google-technology-powered solution that judges can run and that you can host publicly without any cost.
