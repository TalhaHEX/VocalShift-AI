from google import genai
import os
def translator(file_name: str):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found")
    client = genai.Client(api_key=api_key)
    with open(f"temp/{file_name}", "r", encoding='utf-8') as f:
        transcription = f.read()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"translate to Urdu:{transcription}",
    )
    return response.text
