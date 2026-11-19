import edge_tts
import asyncio
async def generate_audio(filename: str):
    with open(f"temp/{filename}", "r", encoding='utf-8') as f:
        translation = f.read()
    text = translation
    output_file = "final_audio.mp3"

    communicate = edge_tts.Communicate(text, voice="ur-PK-UzmaNeural")
    await communicate.save(f"temp/{output_file}")

# asyncio.run(generate_audio())
