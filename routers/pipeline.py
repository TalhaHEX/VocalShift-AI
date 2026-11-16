from os import stat
from pydantic import FilePath
from routers.audio import router
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from celery.result import AsyncResult
from src.celery_app import celery_app
from src.tasks import video_dubbing
from routers.auth import get_current_user

import os
import shutil

router = APIRouter()
@router.post("/start")
async def start_pipeline(file: UploadFile = File(...), target_langauge:str = "Urdu",current_user:str = Depends(get_current_user)):
    os.makedirs("uploads",exist_ok=True)
    file_path = os.path.join("uploads",file.filename)
    
    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)
    
    task = video_dubbing.delay(file.filename,target_langauge)
    return{
        "status":"Task Submitted",
        "task_id":task.id,
        "message":"Video is being processed in the background. Use status t check progress."
    }


@router.get("/task_status/{task_id}")
async def get_task_status(task_id:str):
    task_result = celery_app.AsyncResult(task_id)

    response = {
        "task_id": task_id,
        "status": task_result.status
    }
    if task_result.status == "PROCESSING":
        response["progress"] =  task_result.info.get("step")

    elif task_result.status == "SUCCESS":
        response["result"] =  task_result.result

    elif task_result.status == "FAILURE":
        response["error"] =  str(task_result.info)
    
    return response     

@router.get("/download_video/{filename}")
async def download_video(filename:str):
    file_path = os.path.join("output",filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404,detail="File not found")
    
    return FileResponse(file_path,media_type="video/mp4",filename=filename)