# Deploy ResilienceHunter AI on Railway (Free Trial / Hobby)

Railway is currently one of the easiest platforms. They give new accounts free credits.

---

## Step-by-step

### 1. Create Railway account

1. Go to → **https://railway.app**
2. Click **Login** → Sign up with **GitHub** (recommended)
3. New accounts usually get **$5 free credit** every month (enough for demos)

---

### 2. Put code on GitHub (if not already done)

If you haven’t pushed the code yet:

```bash
cd resilience-hunter-ai
git init
git add .
git commit -m "ResilienceHunter AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resilience-hunter-ai.git
git push -u origin main
```

---

### 3. Deploy on Railway

1. Go to **https://railway.app/dashboard**
2. Click **New Project**
3. Choose **Deploy from GitHub repo**
4. Select your `resilience-hunter-ai` repository
5. Railway will detect it’s a Node.js app

---

### 4. Configure the service

After the service is created:

1. Click on the service
2. Go to **Variables** tab
3. Add these variables:

| Variable          | Value                          |
|-------------------|--------------------------------|
| `GEMINI_API_KEY`  | Your free Gemini key           |
| `NODE_ENV`        | `production`                   |
| `PORT`            | `8080`                         |

4. Go to **Settings** → **Networking** → click **Generate Domain**
   - This gives you a public URL like `https://resilience-hunter-production-xxxx.up.railway.app`

5. Make sure the **Start Command** is:
```
node server/index.mjs
```

(You can set it under Settings → Deploy)

---

### 5. Deploy

Railway will automatically deploy when you connect the repo.  
You can also click **Deploy** manually.

Wait 2–4 minutes.

---

### 6. Your live URL

Once deployed you will get a public URL.  
Open it → click **Run Agent** → it should work.

---

## Notes

- Railway free/hobby credits are enough for a competition demo
- If it asks for a card later, you can still use the free credits first
- Cold starts are usually better than Render free tier

---

## If Railway also asks for a card immediately

Reply and tell me — I will give you the next free options (Fly.io or a completely card-free alternative).
