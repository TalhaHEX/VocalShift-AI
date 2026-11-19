from unicodedata import name
from fastapi import FastAPI
import uvicorn
from routers.extract_audio import router as extract_audio_router
from routers.transcribe import router as transcribe_router
from routers.translate import router as translate_router
from fastapi.staticfiles import StaticFiles
from routers.audio import router as audio_router
from fastapi.middleware.cors import CORSMiddleware
from routers.video import router as video_router
from routers.auth import router as auth_router
from src import models
from routers.pipeline import router as pipeline_router 
from src.database import engine, Base
import os
app = FastAPI(title="VocalShift AI",version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)
os.makedirs("uploads",exist_ok=True)
os.makedirs("temp",exist_ok=True)
os.makedirs("output",exist_ok=True)

app.mount("/uploads",StaticFiles(directory="uploads"),name="uploads")
app.mount("/temp",StaticFiles(directory="temp"),name="temp")
app.mount("/output",StaticFiles(directory="output"),name="output")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router,prefix="/api/auth",tags=["Authentication"])
app.include_router(extract_audio_router,prefix="/api/video",tags=["Extract Audio"])
app.include_router(transcribe_router,prefix="/api/transcribe",tags=["Transcription"])
app.include_router(translate_router,prefix="/api/translate",tags=["Translation"])
app.include_router(audio_router,prefix="/api/audio",tags=["Audio Generation"])
app.include_router(video_router,prefix="/api/video",tags=["Video Generation"])
app.include_router(pipeline_router, prefix="/api/dubbing", tags=["1-Auto Dubbing Pipeline"])
app.include_router(pipeline_router, prefix="/api/pipeline", tags=["1-Auto Dubbing Pipeline"])
if __name__ == "__main__":
    uvicorn.run("app:app",host="localhost",port=3003,reload=True)
