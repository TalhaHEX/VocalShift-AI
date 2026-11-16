from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from src.translator import translator
import os
from routers.auth import get_current_user
from fastapi import Depends

router = APIRouter()

class TranslatesRequest(BaseModel):
    transcript_file: str
    target_language: str = "Urdu"

@router.post("/translate")
async def translate_transcription(data:TranslatesRequest,user:str = Depends(get_current_user)):
    input_path = os.path.join("temp",data.transcript_file)
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404,detail=f"File {data.transcript_file} not found in temp.")
    
    translation = translator(data.transcript_file)
    output_filename = f"translated_{data.transcript_file}"
    output_path = os.path.join("temp",output_filename)
    with open(output_path,"w",encoding="utf-8") as f:
        f.write(translation)

    return {
        "status":"success",
        "translated_file":output_filename,
        "translation_preview":translation[:200]
    }
