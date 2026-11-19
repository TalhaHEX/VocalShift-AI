# 🎬 VocalShift-AI Studio Frontend

A modern, dark-mode-first Creative Studio and Media Production web application for **VocalShift-AI**, engineered with Next.js 15 (App Router), TypeScript, and Tailwind CSS.

---

## 🌟 Architecture & Features

- **🎨 Studio Creative UI:** Built with Obsidian/Zinc studio aesthetics (`#09090B`, `#121215`), hairline borders, and subtle amber accents inspired by Linear, Descript, and ElevenLabs.
- **🔐 JWT Authentication:** Full login and registration flows connected to `/api/auth/register` and `/api/auth/login`, with Bearer token storage and session validation via `/api/auth/profile`.
- **⚡ 1-Click Studio (`/` & `/studio`):**
  - Drag-and-drop master video uploader with client-side format and file size validation.
  - Instant local video preview before dispatch.
  - Multi-language target dialect selector (Urdu, English, Hindi, Arabic) with native voice tags.
  - **Live 5-Stage Stepper Tracker:** Real-time 2-second Celery polling reflecting:
    1. `1/5` Audio Extraction (MoviePy)
    2. `2/5` Speech Transcription (OpenAI Whisper)
    3. `3/5` Contextual Translation (Gemini 2.5 Flash)
    4. `4/5` Neural Voice Synthesis (Edge-TTS)
    5. `5/5` Video Remuxing (FFmpeg / MoviePy)
  - Elapsed timer, Celery `task_id` copy-to-clipboard, and error recovery.
  - **Synchronized Video Comparison Player:** Side-by-side or toggled A/B comparison of original vs. dubbed video with timeline scrubbing, audio track switching, and primary download.
- **🔬 Granular Workbench (`/workbench`):**
  - Modular laboratory exposing backend endpoints step-by-step:
    1. Video Upload (`POST /api/video/upload_video_file`) & list server uploads (`GET /api/video/list_upload_files`).
    2. Audio Extraction (`POST /api/video/extract_audio/{file_name}`).
    3. Transcription (`POST /api/transcribe/transcribe_audio/{file_name}`) with live editable transcript.
    4. Translation (`POST /api/translate/translate`) with editable translated text.
    5. Speech Synthesis (`POST /api/audio/generate_audio/{file_name}`) with inline HTML5 audio player.
    6. Video Remuxing (`POST /api/video/replace_audio`) with rendered MP4 preview and download.

---

## 🚀 Running the Frontend

### 1. Install Dependencies
Inside the `frontend` folder:
```bash
npm install
```

### 2. Configure Environment
Verify `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Backend Connectivity

Make sure the FastAPI backend is running on `http://localhost:3003` along with PostgreSQL, Redis, and the Celery worker:
```bash
# In Backend directory:
# With Docker:
docker compose up --build

# Or locally:
python -m celery -A src.celery_app.celery_app worker --loglevel=info --pool=solo
python app.py
```
