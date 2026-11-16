from fastapi import FastAPI
import uvicorn
from routers.extract_audio import router as extract_audio_router
from routers.transcribe import router as transcribe_router
from routers.translate import router as translate_router
from routers.audio import router as audio_router
from routers.video import router as video_router
from routers.auth import router as auth_router
from src import models
from routers.pipeline import router as pipeline_router 
from src.database import engine, Base
app = FastAPI(title="VocalShift AI",version="1.0")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router,prefix="/api/auth",tags=["Authentication"])
app.include_router(extract_audio_router,prefix="/api/video",tags=["Extract Audio"])
app.include_router(transcribe_router,prefix="/api/transcribe",tags=["Transcription"])
app.include_router(translate_router,prefix="/api/translate",tags=["Translation"])
app.include_router(audio_router,prefix="/api/audio",tags=["Audio Generation"])
app.include_router(video_router,prefix="/api/video",tags=["Video Generation"])
app.include_router(pipeline_router, prefix="/api/dubbing", tags=["1-Auto Dubbing Pipeline"])
if __name__ == "__main__":
    uvicorn.run("app:app",host="localhost",port=3003,reload=True)
