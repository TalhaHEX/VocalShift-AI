import os
import uuid
import asyncio
import edge_tts
from src.celery_app import celery_app
from src.audio_extractor import ExtractAudio
from src.transcriber import transcribe_audio
from src.translator import translator
from src.generate_video import replace_audio

VOICE_MAP = {
    "Urdu": "ur-PK-UzmaNeural",
    "English": "en-US-JennyNeural",
    "Hindi": "hi-IN-SwaraNeural",
    "Arabic": "ar-SA-ZariyahNeural"
}

@celery_app.task(bind=True)
def video_dubbing(self,video_filename:str, target_language: str="Urdu"):
    task_id = str(self.request.id or uuid.uuid4())
    
    #Paths Setup
    video_path = os.path.join("uploads",video_filename)
    extracted_audio_path = os.path.join("temp",f"{task_id}_extracted.mp3")
    transcript_path = os.path.join("temp",f"{task_id}_transcript.txt")
    translated_path = os.path.join("temp",f"{task_id}_translated.txt")
    generated_audio_path = os.path.join("temp",f"{task_id}_dubbed.mp3")
    os.makedirs("temp", exist_ok=True)
    os.makedirs("output",exist_ok=True)
    final_video_name = f"final_{task_id}.mp4"
    final_video_path = os.path.join("output",final_video_name)

    # Status Steps
    self.update_state(state="PROCESSING",meta={"step":"1/5 : Extracting audio from video"})
    extractor = ExtractAudio(video_path,extracted_audio_path)
    extractor.extract()

    self.update_state(state="PROCESSING",meta={"step":"2/5 : Transcribing speech with Whisper"})
    transcript_text = transcribe_audio(extracted_audio_path)
    with open(transcript_path,"w",encoding="utf-8") as f:
        f.write(transcript_text)

    self.update_state(state="PROCESSING",meta={"step":f"3/5 : Translating to {target_language}"})
    translated_text = translator(f"{task_id}_transcript.txt")
    with open(translated_path, "w", encoding="utf-8") as f:
        f.write(translated_text)
    
    self.update_state(state="PROCESSING",meta={"step": f"4/5 : Generating {target_language} voice audio"})
    voice = VOICE_MAP.get(target_language,"ur-PK-UzmaNeural")

    async def create_tts():
        communicate = edge_tts.Communicate(translated_text,voice=voice)
        await communicate.save(generated_audio_path)
    
    asyncio.run(create_tts())

    self.update_state(state="PROCESSING",meta={"step":"5/5 : Merging new audio into final video"})
    replace_audio(video_path,generated_audio_path,final_video_path)
    return {
        "status": "COMPLETED",
        "original_video": video_filename,
        "final_video_file": final_video_name,
        "final_video_path": final_video_path,
        "target_language": target_language
    }