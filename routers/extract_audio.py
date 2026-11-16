from fastapi import Depends
from fastapi import APIRouter,File, UploadFile,Response
from src.audio_extractor import ExtractAudio
from moviepy import video
from pydantic import BaseModel
import uuid
from routers.auth import get_current_user
import os
router = APIRouter()

os.makedirs("uploads", exist_ok=True)
os.makedirs("temp", exist_ok=True)

@router.post("/upload_video_file")
async def upload_file(file:UploadFile = File(...),user:str=Depends(get_current_user)):
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    return {"Success": f"Video uploaded successfully - {file.filename}."}


@router.get("/list_upload_files")
async def list_upload_files(user:str=Depends(get_current_user)):
    files = os.listdir("uploads")
    return {"files": files}

@router.post("/extract_audio/{file_name}")
async def extract_audio(file_name:str,user:str=Depends(get_current_user)):
    file_path = f"uploads/{file_name}"
    if not os.path.exists(file_path):
        return {"Error": f"File {file_name} does not exist."}

    audio_filename = f"{uuid.uuid4()}.mp3"
    audio_extractor = ExtractAudio(input_file=file_path, output_file=f"temp/{audio_filename}")
    audio_extractor.extract()
    return {
        "status": "success",
        "audio_file": audio_filename
    }