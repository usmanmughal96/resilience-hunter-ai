# Deploy ResilienceHunter AI on Render.com (Completely Free – No Credit Card)

Render offers a free tier that is perfect for competition demos. No payment method is required for the free plan in most regions.

---

## Step-by-step Guide

### 1. Create a free Render account

1. Go to: **https://render.com**
2. Click **Get Started** → Sign up with GitHub / Google / email
3. No credit card is asked for the free tier

---

### 2. Prepare the code (two easy ways)

#### Way A – Easiest: Deploy from GitHub (recommended)

1. Create a new repository on GitHub (public is fine)
2. Upload / push the entire `resilience-hunter-ai` folder to that repo
3. Come back to Render

#### Way B – Deploy without GitHub (using Render Blueprint or manual)

You can also upload the code later. For speed we will use the GitHub method.

---

### 3. Create a new Web Service on Render

1. In Render Dashboard → click **New +** → **Web Service**
2. Connect your GitHub account if not already connected
3. Select the repository that contains `resilience-hunter-ai`
4. Fill the form exactly like this:

| Setting              | Value                                      |
|----------------------|--------------------------------------------|
| **Name**             | `resilience-hunter`                        |
| **Region**           | Oregon (or any)                            |
| **Branch**           | `main` (or whatever your branch is)        |
| **Root Directory**   | leave empty **or** put `resilience-hunter-ai` if the code is inside a subfolder |
| **Runtime**          | `Node`                                     |
| **Build Command**    | `npm install`                              |
| **Start Command**    | `node server/index.mjs`                    |
| **Instance Type**    | **Free**                                   |

5. Click **Advanced** → Add Environment Variable:

| Key              | Value                          |
|------------------|--------------------------------|
| `GEMINI_API_KEY` | your free key from AI Studio   |
| `PORT`           | `10000` (Render sets this automatically, but good to have) |
| `NODE_ENV`       | `production`                   |

6. Click **Create Web Service**

---

### 4. Wait for the first deploy

- Render will install dependencies and start the server
- First deploy usually takes 2–5 minutes
- When it finishes you will get a live URL like:

```
https://resilience-hunter.onrender.com
```

**This is your deployed solution.**

---

### 5. Important free tier notes

- Free services on Render **spin down after ~15 minutes of inactivity**
- First request after sleep can take 30–50 seconds (cold start)
- This is normal and acceptable for a competition demo
- You can mention in your submission: “Hosted on Render free tier”

---

### 6. Test your live site

1. Open the Render URL
2. Click **Run Agent**
3. You should see the full interface and agent working

If Gemini key is set correctly you will also get intelligent briefs.

---

### 7. What to submit

- Live URL (the `.onrender.com` link)
- Short demo video
- Source code
- Mention: “AI agent for climate & disaster resilience opportunities, powered by Gemini + multi-source discovery, deployed on free tier”

---

## Troubleshooting

| Problem                        | Solution |
|--------------------------------|----------|
| Build fails                    | Make sure Root Directory is correct |
| App crashes / port error       | Start command must be `node server/index.mjs` |
| Gemini not working             | Double-check the environment variable name is exactly `GEMINI_API_KEY` |
| Site sleeps too fast           | Normal on free tier. Judges usually understand cold starts |

---

## Optional: Make cold starts better

You can use a free uptime monitor (e.g. UptimeRobot) to ping your site every 10–14 minutes so it stays awake. Not required, but nice.

---

That’s it. You now have a free public URL without putting any payment method.
