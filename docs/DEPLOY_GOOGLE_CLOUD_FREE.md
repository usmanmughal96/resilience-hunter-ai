# Deploy ResilienceHunter AI on Google Cloud — Completely Free / Free Trial

This guide shows you how to deploy the full solution on Google Cloud using **only free tiers + the always-free Google AI Studio key**.  
No paid resources required for a live demo that judges can click.

---

## Overview of free path

| Component              | Service used              | Cost                              |
|------------------------|---------------------------|-----------------------------------|
| Reasoning (Gemini)     | Google AI Studio          | **Free forever** (no GCP needed) |
| Hosting the agent      | Cloud Run                 | Free tier (2M requests/month)    |
| Optional storage       | Cloud Storage             | 5 GB free                        |
| Optional data analytics| BigQuery                  | 1 TB queries/month free          |
| Optional geospatial    | Earth Engine              | Free research account            |
| Optional alerts        | Pub/Sub                   | 10 GB/month free                 |

**Total cost for a competition demo: $0**

---

## Step-by-step (recommended order)

### 1. Get a free Gemini key (30 seconds) — do this first

1. Open https://aistudio.google.com/app/apikey
2. Sign in with any Google account
3. Click **Create API key**
4. Copy the key (starts with `AIza...`)

This key works without any Google Cloud project and is perfect for the competition.

---

### 2. Create a free Google Cloud project (if you don’t have one)

1. Go to https://console.cloud.google.com/
2. Click the project dropdown → **New Project**
3. Name it `resilience-hunter` (or anything)
4. Create it

> New accounts usually get **$300 free credits** for 90 days.  
> Even without credits, Cloud Run free tier is enough for demos.

Enable billing only if prompted (you will not be charged while staying inside free tier limits).

---

### 3. Enable the required APIs

In the Cloud Console search bar, enable these one by one:

- Cloud Run API
- Cloud Build API
- Artifact Registry API (or Container Registry)
- (Optional) BigQuery API
- (Optional) Cloud Storage

Or run in Cloud Shell:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

---

### 4. Deploy with one command (Cloud Run)

**Easiest method — from your laptop or Cloud Shell**

1. Install Google Cloud SDK if needed: https://cloud.google.com/sdk/docs/install
2. Login and set project:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

3. Go into the project folder and deploy:

```bash
cd resilience-hunter-ai

gcloud run deploy resilience-hunter \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=AIzaYourKeyHere" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3
```

- `--source .` tells Cloud Build to build from the Dockerfile we included
- `--allow-unauthenticated` makes the URL public (needed for judges)
- `--min-instances 0` = scales to zero → **no cost when idle**

After 2–4 minutes you will get a live URL like:

```
https://resilience-hunter-xxxxxxx-uc.a.run.app
```

That is your **deployed solution**. Share this link with the judges.

---

### 5. Alternative: Deploy from Cloud Shell (no local install)

1. Open https://shell.cloud.google.com/
2. Upload the zip or clone the code
3. Unzip and run the same `gcloud run deploy` command above

---

### 6. (Optional) Add more Google services later

**BigQuery** – store historical alerts or vulnerability data  
**Earth Engine** – replace the demo EE signals with real satellite analysis  
**Pub/Sub** – push CRITICAL alerts to Telegram / email  
**Cloud Storage** – store satellite imagery or reports  

All of these have free tiers sufficient for a competition demo.

---

## Important free-tier tips so you stay at $0

- Keep `--min-instances 0` (scales to zero when no traffic)
- Use 512Mi memory (enough for this app)
- Stay under 2 million requests/month (judges will never hit this)
- Gemini key from AI Studio is completely free and does **not** consume Vertex AI quota

---

## After deployment — what to submit

1. Live URL (the Cloud Run link)
2. Short demo video (30–90 seconds) showing the agent running on the live URL
3. GitHub / zip of the source code
4. One-paragraph description highlighting:
   - Climate & disaster resilience focus
   - Gemini reasoning
   - Multi-source agent + Earth Engine signals
   - Fully free-tier deployable

---

## Troubleshooting

| Problem                        | Fix |
|--------------------------------|-----|
| “Billing account required”     | Link a billing account (you still stay free with min-instances=0) |
| Build fails                    | Make sure Dockerfile is in the root of the folder you deploy |
| Gemini not working             | Double-check the env var name is exactly `GEMINI_API_KEY` |
| Cold start slow                | Normal for free tier (scales from zero). First request ~5–10 s |

---

## One-command reminder

```bash
gcloud run deploy resilience-hunter \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=YOUR_FREE_KEY" \
  --memory 512Mi \
  --min-instances 0
```

You now have a **live, public, free Google Cloud deployment** of an AI agent that uses the exact technologies the challenge recommends.
