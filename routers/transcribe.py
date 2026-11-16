from src.transcriber import transcribe_audio
from fastapi import APIRouter,UploadFile, File
import os
from fastapi import Depends
from routers.auth import get_current_user

router = APIRouter()
@router.post("/transcribe_audio/{file_name}")
async def transcribe(file_name: str,user:str=Depends(get_current_user)):
    file_location = f"temp/{file_name}"
    transcription = transcribe_audio(file_location)
    output_filename = f"{file_name}.txt"
    with open(f"temp/{output_filename}","w",encoding="utf-8") as f:
        f.write(transcription)
    
    return{
        "status":"success",
        "transcript_file":output_filename,
        "transcription":transcription
    }

@router.get("/audio-list")
def audio_list():
    audio_files = os.listdir("temp")
    return {"Audio Files": audio_files}
