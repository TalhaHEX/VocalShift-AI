from fastapi import APIRouter
from src.generate_audio import generate_audio
import asyncio
from routers.auth import get_current_user
from fastapi import Depends

router = APIRouter()

@router.post("/generate_audio/{file_name}")
async def generate_audio_endpoint(file_name: str,user:str=Depends(get_current_user)):
    await generate_audio(file_name)
    return {
        "status":"success",
        "audio_file":"final_audio.mp3"     
    }
