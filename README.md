# DUO AI — Your Personal AI Travel Companion

Sentient AI travel guide that brings the world around you to life.

This project builds on architectural research into **spatial intelligence**, **AI-assisted accessibility**, and **human–computation** frameworks to augment place-based exploration. DUO applies techniques from **egocentric computer vision**, **contextual NLP**, and **interactive design systems** to enhance experiential understanding of real-world environments.

DUO uses your camera to see what you see, engaging you with rich descriptions and interactive dialogue. Explore the world like never before.

---

## Features

- 📸 **Visual Recognition**: Uses the device camera and Google Gemini to identify landmarks, art, and objects.
- 🗣️ **Conversational AI**: Generates detailed, engaging descriptions based on your customizable personality and interest preferences.
- 🔊 **Voice Interaction**: Text-to-Speech (ElevenLabs) + Speech-to-Text for hands-free follow-up questions.
- 👆 **Interactive Image Exploration**: Tap/long-press on any part of a captured image to ask questions about that region.
- 📓 **Trip Journals**: Save discoveries as “highlights” (image + conversation) organized into trips.
- 🔧 **Personalization**: Tune AI personality (factual vs. creative), interests (art, history, nature, etc.), and voice speed.
- 📱 **PWA Ready**: Designed as a Progressive Web App for a native-ish mobile feel.

---

## Tech Stack

**Frontend**
- React, TypeScript, Vite
- Tailwind CSS

**AI / Speech**
- Google Gemini (vision + chat)
- ElevenLabs (Text-to-Speech)
- Web Speech API (Speech-to-Text)

**Backend**
- Node.js + Express (secure proxy for API keys)

**Deployment**
- Docker
- Google Cloud Run + Cloud Build
- Secret Manager (recommended for keys)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Google Cloud SDK (`gcloud`) authenticated

---

## Clone + Run Locally

### 1) Clone the repository
```bash
git clone https://github.com/lborunda/DUO3.git
cd DUO3
```

### 2) Install dependencies
```bash
npm install
cd server && npm install
cd ..
```

### 3) Configure environment variables

Use `.env.example` as a template (don’t commit real keys).

**Root `.env` (frontend / Vite)**
```bash
GEMINI_API_KEY=your_google_gemini_api_key
```

**`server/.env` (backend proxy)**
```bash
GEMINI_API_KEY=your_google_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### 4) Run dev mode
```bash
npm run dev
```

---

## Project Structure

```
/
├── server/            # Node.js backend proxy (API keys live here)
├── src/               # Frontend app (React/Vite)
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types.ts
├── Dockerfile
├── package.json
└── vite.config.ts
```

---

## Important Note (White Screen Fix)

Vite loads the app from:

```
src/main.tsx → src/App.tsx
```

If `src/App.tsx` is an empty placeholder (e.g., `return <div></div>`), the build will succeed and Cloud Run will show a **white screen** even though the JS/CSS assets load correctly.

**Fix**: keep `src/App.tsx` as the single source of truth for the UI.

---

## Deploy to Google Cloud Run (Manual, Reliable)

This bypasses “auto-generated image name” issues sometimes seen with Developer Connect.

### 1) Build and push the container image
From Cloud Shell (or your machine with gcloud configured):

```bash
gcloud builds submit . --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cloud-run-source-deploy/duo3:latest
```

If the Artifact Registry repository doesn’t exist:

```bash
gcloud artifacts repositories create cloud-run-source-deploy   --repository-format=docker   --location=us-central1
```

### 2) Deploy to Cloud Run
```bash
gcloud run deploy duo3   --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cloud-run-source-deploy/duo3:latest   --region us-central1   --allow-unauthenticated
```

---

## Secrets (Recommended)

### Create secrets
```bash
printf %s "YOUR_GEMINI_KEY" | gcloud secrets create gemini_api_key --data-file=-
printf %s "YOUR_ELEVENLABS_KEY" | gcloud secrets create elevenlabs_api_key --data-file=-
```

### Attach secrets to Cloud Run
```bash
gcloud run services update duo3   --region us-central1   --update-secrets GEMINI_API_KEY=gemini_api_key:latest,ELEVENLABS_API_KEY=elevenlabs_api_key:latest
```

---

## Auto-Deploy on Push (Optional)

If your org/project allows Cloud Build triggers, you can set:
- Event: push to `main`
- Build: Dockerfile at `./Dockerfile`
- Deploy: Cloud Run service `duo3`

(If you want a fully controlled setup, add a `cloudbuild.yaml` to build + deploy with a stable image name.)

---

## Collaboration / Teaching Tips

- Fork or clone the repo and use `.env.example` for students.
- Use GitHub Issues/Projects to assign tasks.
- Consider Codespaces or VS Code Dev Containers for consistent environments.

---

## Author

Luis Borunda  
lborunda@vt.edu

---

## License

Apache License 2.0  
© 2025–2026 Luis Borunda
