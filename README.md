# 🎬 VocalShift-AI

<p align="center">
  <strong>An automated, end-to-end AI video dubbing and language translation pipeline powered by Whisper, Gemini, Edge-TTS, FastAPI, Celery, and Docker.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-blue.svg" alt="Python 3.13" />
  <img src="https://img.shields.io/badge/FastAPI-0.162+-009688.svg" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Celery-5.4+-37814A.svg" alt="Celery" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED.svg" alt="Docker" />
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0-red.svg" alt="SQLAlchemy 2.0" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌟 Overview

**VocalShift-AI** is a production-ready asynchronous video dubbing engine. It allows users to upload a video in one language and automatically produces a high-quality dubbed video in another target language (currently supporting Urdu with multi-language architecture ready for expansion).

The platform leverages state-of-the-art AI models and a decoupled background task architecture to handle heavy computation without freezing API requests.

---

## ⚡ The AI Pipeline

```
[ Upload Video ]
       │
       ▼
[ 1. Audio Extraction ] ───► MoviePy extracts raw audio (.mp3)
       │
       ▼
[ 2. Transcription ]    ───► OpenAI Whisper generates accurate speech-to-text
       │
       ▼
[ 3. AI Translation ]   ───► Google Gemini (gemini-2.5-flash) translates dialogue
       │
       ▼
[ 4. Voice Synthesis ]  ───► Edge-TTS synthesizes natural neural speech
       │
       ▼
[ 5. Video Remuxing ]   ───► MoviePy combines original video with translated audio
       │
       ▼
[ Download Dubbed Video ]
```

---

## ✨ Features

- **🚀 1-Click Asynchronous Pipeline:** Upload a video and receive an immediate `task_id`. Monitor progress step-by-step (`1/5`, `2/5`, ..., `5/5`) without HTTP timeouts.
- **🎙️ Automatic Speech Recognition (ASR):** Powered by OpenAI Whisper for robust transcription.
- **🌐 AI-Powered Translation:** Uses Google Gemini (`gemini-2.5-flash`) for culturally nuanced and context-aware translations.
- **🗣️ Natural Voice Synthesis:** Edge-TTS neural speech engine with extensible voice mappings.
- **🔐 JWT Authentication:** Bearer token security protecting endpoints with HTTPBearer Swagger UI integration.
- **🗄️ PostgreSQL Database (SQLAlchemy 2.0):** Modern type-safe `Mapped` models for persistent user accounts.
- **⚡ Celery & Redis Task Queue:** Decoupled job scheduling for CPU-intensive video and audio processing.
- **🐳 Full Docker & Docker Compose Support:** Single-command setup running PostgreSQL, Redis, FastAPI, and Celery worker.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance asynchronous REST API |
| **Task Queue & Broker** | [Celery](https://docs.celeryq.dev/) + [Redis](https://redis.io/) | Distributed background task processing |
| **Speech-to-Text** | [OpenAI Whisper](https://github.com/openai/whisper) | Accurate speech transcription |
| **Translation Engine** | [Google Gemini API](https://ai.google.dev/) | Contextual multi-language translation |
| **Voice Synthesis** | [Edge-TTS](https://github.com/rany2/edge-tts) | Neural voice generation |
| **Video Processing** | [MoviePy](https://zulko.github.io/moviepy/) + [FFmpeg](https://ffmpeg.org/) | Audio extraction and video remuxing |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | User management & data persistence |
| **Containerization** | [Docker](https://www.docker.com/) & Docker Compose | Multi-container orchestration |

---

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A [Google Gemini API Key](https://aistudio.google.com/).

### 1. Clone the Repository
```bash
git clone https://github.com/TalhaHEX/VocalShift-AI.git
cd VocalShift-AI
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and paste your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Build and Run
```bash
docker compose up --build
```

That's it! Docker will start:
- 🐘 PostgreSQL (`localhost:5432`)
- 🔴 Redis (`localhost:6379`)
- 🌐 FastAPI Web Server (`http://localhost:3003`)
- ⚙️ Celery Background Worker

Open **[http://localhost:3003/docs](http://localhost:3003/docs)** in your browser to access the interactive Swagger UI.

---

## 💻 Manual Local Setup

### 1. Create Virtual Environment
```bash
# Using uv (fastest)
uv venv
.venv\Scripts\activate   # Windows
# or source .venv/bin/activate # Linux/Mac

uv pip install -r pyproject.toml
```

### 2. Install FFmpeg
Make sure `ffmpeg` is installed on your system and added to your `PATH`.

### 3. Start Redis & PostgreSQL
Ensure PostgreSQL and Redis servers are running locally.

### 4. Run Celery Worker
```bash
# On Linux / WSL:
celery -A src.celery_app.celery_app worker --loglevel=info

# On Windows (PowerShell):
python -m celery -A src.celery_app.celery_app worker --loglevel=info --pool=solo
```

### 5. Run FastAPI Server
```bash
python app.py
# or: uvicorn app:app --reload --port 3003
```

---

## 📖 API Documentation

Once the server is running, visit `http://localhost:3003/docs` for the interactive OpenAPI documentation.

### Key Endpoints:

#### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and obtain JWT Bearer token
- `GET /api/auth/profile` - Verify token and view current user

#### 🚀 1-Click Pipeline (`/api/pipeline`)
- `POST /api/pipeline/start` - Upload video & trigger full background dubbing
- `GET /api/pipeline/task_status/{task_id}` - Check live progress (`1/5` to `5/5`)
- `GET /api/pipeline/download_video/{filename}` - Download the completed dubbed video

#### 🧩 Granular Steps (Individual Tooling)
- `POST /api/video/upload_video_file` - Upload raw video file
- `POST /api/video/extract_audio/{file_name}` - Extract audio track
- `POST /api/transcribe/transcribe_audio/{file_name}` - Transcribe with Whisper
- `POST /api/translate/translate` - Translate transcript with Gemini
- `POST /api/audio/generate_audio/{file_name}` - Synthesize target audio with Edge-TTS
- `POST /api/video/replace_audio` - Remux audio into original video

---

## 🗺️ Roadmap

- [ ] Dynamic voice selection per target language in Swagger UI.
- [ ] SRT subtitle generation and burning option.
- [ ] Speaker diarization (multi-speaker detection).
- [ ] Voice cloning integration for actor voice preservation.

---

## 👤 Author

Developed by **[Talha Zunair](https://github.com/TalhaHEX)**  
Contact: [talhazunair37@gmail.com](mailto:talhazunair37@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
