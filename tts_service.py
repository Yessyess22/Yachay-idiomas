import io
import os
import numpy as np
import torch
import soundfile as sf
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from transformers import VitsModel, AutoTokenizer

app = FastAPI(title="Yachay Quechua TTS Microservice")

# Permitir llamadas desde Expo Web (localhost:8081) y móvil
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_ID = "facebook/mms-tts-quz"
HF_TOKEN = os.getenv("HF_TOKEN")
print(f"[*] Cargando modelo Meta MMS-TTS Quechua ({MODEL_ID})...")

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)
    model = VitsModel.from_pretrained(MODEL_ID, token=HF_TOKEN)
    model.eval()
    print("[+] Modelo Quechua cargado exitosamente en memoria.")
except Exception as e:
    print(f"[-] Error al cargar modelo: {e}")
    model = None
    tokenizer = None


@app.get("/health")
def health():
    return {
        "status": "online" if model is not None else "error",
        "model": MODEL_ID,
        "language": "Quechua Cusco (quz)"
    }


from pydantic import BaseModel

class TTSRequest(BaseModel):
    text: str

@app.post("/tts")
def synthesize_quechua_post(req: TTSRequest):
    return _generate_audio(req.text)

@app.get("/tts")
def synthesize_quechua(text: str = Query(..., description="Palabra o frase en Quechua")):
    return _generate_audio(text)

ACHAHALA_PHONEMES = {
    # Vocales: doble para que suene sostenida y clara
    "a": "a a",
    "i": "i i",
    "u": "u u",
    # Consonantes y grupos consonánticos con su sílaba natural
    "ch": "cha",
    "sh": "sha",
    "h": "ja",
    "j": "ja",
    "k": "ka",
    "kh": "kha",
    "l": "la",
    "ll": "lla",
    "m": "ma",
    "n": "na",
    "ñ": "ña",
    "p": "pa",
    "ph": "pha",
    "q": "qa",
    "qh": "qha",
    "r": "ra",
    "s": "sa",
    "t": "ta",
    "th": "tha",
    "w": "wa",
    "y": "ya",
}

def _generate_audio(text: str):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")

    clean_text = text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Texto vacío")

    # Mapeo lingüístico y fonético Achahala
    lookup_key = clean_text.lower()
    if lookup_key in ACHAHALA_PHONEMES:
        spoken_text = ACHAHALA_PHONEMES[lookup_key]
    else:
        spoken_text = lookup_key

    try:
        inputs = tokenizer(spoken_text, return_tensors="pt")
        with torch.no_grad():
            output = model(**inputs).waveform

        # Convertir tensor a audio WAV en memoria
        audio_arr = output.squeeze().cpu().numpy()
        sampling_rate = model.config.sampling_rate

        # Normalización de amplitud inteligente:
        # Solo normalizar si hay voz real (peak >= 0.035) para evitar amplificar el piso de ruido.
        peak = np.max(np.abs(audio_arr))
        if peak >= 0.035:
            audio_arr = (audio_arr / peak) * 0.85

        # Margen de silencio protector inicial y final (cada palabra se pronuncia exactamente UNA vez)
        pad_intro = np.zeros(int(sampling_rate * 0.12), dtype=np.float32)
        pad_outro = np.zeros(int(sampling_rate * 0.18), dtype=np.float32)
        audio_arr = np.concatenate([pad_intro, audio_arr, pad_outro])

        buf = io.BytesIO()
        sf.write(buf, audio_arr, sampling_rate, format="WAV")
        buf.seek(0)

        return StreamingResponse(
            buf,
            media_type="audio/wav",
            headers={
                "Content-Disposition": f'inline; filename="quechua_{clean_text[:10]}.wav"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en síntesis: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
