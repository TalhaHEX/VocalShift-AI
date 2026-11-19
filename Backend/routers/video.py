from src.generate_video import replace_audio
from fastapi import APIRouter,HTTPException
import asyncio
import os
from pydantic import BaseModel
from fastapi import Depends
from routers.auth import get_current_user
router = APIRouter()

class ReplaceAudioRequest(BaseModel):
    video_file: str
    audio_file: str
    output_file: str = "final_video.mp4"

@router.post("/replace_audio")
async def replace_audio_endpoint(data:ReplaceAudioRequest,user:str = Depends(get_current_user)):
    video_path = os.path.join("uploads",data.video_file)
    audio_path = os.path.join("temp",data.audio_file)
    os.makedirs("output",exist_ok=True)
    output_path = os.path.join("output",data.output_file)

    if not os.path.exists(video_path):
        raise HTTPException(status_code=404,detail="Video File not found")

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404,detail="Audio file not found")

    await asyncio.to_thread(replace_audio,video_path,audio_path,output_path)
    return {
        "status":"success",
        "output_file":data.output_file,
        "output_path":output_path
    }