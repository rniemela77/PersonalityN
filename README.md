# PersonalityN

## Overview
PersonalityN is a Vue 3 application built with Vite. It uses Firebase (Auth, Firestore, Analytics) on the client and includes a simple Netlify Function for serverless APIs. The app is router-enabled via Vue Router.

- **Frontend**: Vue 3 + Vite
- **Backend (serverless)**: Netlify Functions (`netlify/functions`)
- **Services**: Firebase Auth, Firestore, Analytics, Openai

## Prerequisites
- Node.js 18+ and npm 8+
- (Optional) Netlify CLI for local functions/dev proxy

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Visit the app at the URL printed in your terminal (typically `http://localhost:5173`).

### Running with Netlify Dev (local serverless functions)
If you want the Netlify Functions to run locally and be proxied to your frontend:
```bash
npm run dev:netlify
```
This command uses the Netlify CLI to run both the frontend and functions together. The function endpoint will be available at `/.netlify/functions/hello`.

Example request:
```bash
curl "http://localhost:8888/.netlify/functions/hello?name=World"
```

## Scripts
Defined in `package.json`:

- `npm run dev`: Start Vite dev server
- `npm run dev:netlify`: Start Netlify Dev (frontend + functions)
- `npm run build`: Build for production
- `npm run preview`: Preview the production build locally

## Firebase
Firebase is initialized in `src/firebase.js` with Auth, Firestore, and Analytics

## OpenAI
OpenAI is initialized in `src/openai.js` and used to generate quiz questions via an API call from the client.

## Netlify Functions
- Functions live in `netlify/functions`. The example function is `hello.js` and is exposed at `/.netlify/functions/hello`.
- Local dev via `npm run dev:netlify` (requires Netlify CLI).

## Build and Preview
- Build:
  ```bash
  npm run build
  ```
- Preview the built app:
  ```bash
  npm run preview
  ```

## Deployment
- `prod` branch deploys to Netlify