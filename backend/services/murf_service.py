# import requests
# import base64
# from config import Config

# def generate_speech(text: str) -> str:
#     """
#     Calls Murf AI API to generate speech.
#     Returns the audio as a base64 encoded string so it can be played on the frontend.
#     """
#     if not Config.MURF_API_KEY:
#         print("[Murf Service] MURF_API_KEY is not configured.")
#         return ""

#     url = "https://global.api.murf.ai/v1/speech/stream"
#     headers = {
#         "api-key": Config.MURF_API_KEY,
#         "Content-Type": "application/json"
#     }
#     data = {
#        "voice_id": "Matthew",
#        "text": text,
#        "locale": "en-US",
#        "model": "FALCON",
#        "format": "MP3",
#        "sampleRate": 24000,
#        "channelType": "MONO"
#     }

#     try:
#         response = requests.post(url, headers=headers, json=data, stream=True)
#         if response.status_code == 200:
#             audio_bytes = bytearray()
#             for chunk in response.iter_content(chunk_size=1024):
#                 if chunk:
#                     audio_bytes.extend(chunk)
            
#             # Encode to base64 so frontend can play it as a data URI
#             return base64.b64encode(audio_bytes).decode('utf-8')
#         else:
#             print(f"[Murf Service] API Error: {response.status_code} - {response.text}")
#             return ""
#     except Exception as e:
#         print(f"[Murf Service] Local Error: {e}")
#         return ""
"""
Murf AI TTS Service
"""

import requests
import base64
from config import Config


def generate_speech(text: str) -> str:
    if not Config.MURF_API_KEY:
        print("Murf API key missing")
        return ""

    url = "https://global.api.murf.ai/v1/speech/stream"

    headers = {
        "api-key": Config.MURF_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "voice_id": "Matthew",
        "text": text,
        "locale": "en-US",
        "model": "FALCON",
        "format": "MP3",
        "sampleRate": 24000,
        "channelType": "MONO"
    }

    try:
        response = requests.post(url, headers=headers, json=data, stream=True)

        if response.status_code == 200:
            audio_bytes = bytearray()

            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    audio_bytes.extend(chunk)

            return base64.b64encode(audio_bytes).decode("utf-8")

        else:
            print("Murf API Error:", response.text)
            return ""

    except Exception as e:
        print("Murf Error:", e)
        return ""