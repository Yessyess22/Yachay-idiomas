"""
Yachay Voice Service — TTS + STT en Quechua.

Un solo microservicio FastAPI con dos capacidades:
  - /tts  → texto Quechua -> audio (Meta MMS-TTS, facebook/mms-tts-quz)
  - /stt  → audio -> texto Quechua (wav2vec2 afinado en Quechua, ivangtorre/wav2vec2-xlsr-300m-quechua)

Se ejecuta local (`python app.py`) para desarrollo, o como Hugging Face Space
(Docker) para que la app compilada (APK/IPA) pueda usarlo sin depender de
que el equipo de desarrollo tenga el servidor prendido en su máquina.
"""
import io
import os

import numpy as np
import torch
import soundfile as sf
from pydub import AudioSegment
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import VitsModel, AutoTokenizer, Wav2Vec2ForCTC, Wav2Vec2Processor

app = FastAPI(title="Yachay Voice Service (TTS + STT Quechua)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.getenv("HF_TOKEN")

# ─── TTS: Meta MMS-TTS Quechua (Cusco) ──────────────────────────────────────
TTS_MODEL_ID = "facebook/mms-tts-quz"
print(f"[*] Cargando modelo de síntesis de voz ({TTS_MODEL_ID})...")
try:
    tts_tokenizer = AutoTokenizer.from_pretrained(TTS_MODEL_ID, token=HF_TOKEN)
    tts_model = VitsModel.from_pretrained(TTS_MODEL_ID, token=HF_TOKEN)
    tts_model.eval()
    print("[+] Modelo de síntesis de voz cargado.")
except Exception as e:
    print(f"[-] Error al cargar modelo TTS: {e}")
    tts_model = None
    tts_tokenizer = None

# ─── STT: wav2vec2 afinado en Quechua ───────────────────────────────────────
STT_MODEL_ID = "ivangtorre/wav2vec2-xlsr-300m-quechua"
print(f"[*] Cargando modelo de reconocimiento de voz ({STT_MODEL_ID})...")
try:
    stt_processor = Wav2Vec2Processor.from_pretrained(STT_MODEL_ID, token=HF_TOKEN)
    stt_model = Wav2Vec2ForCTC.from_pretrained(STT_MODEL_ID, token=HF_TOKEN)
    stt_model.eval()
    print("[+] Modelo de reconocimiento de voz cargado.")
except Exception as e:
    print(f"[-] Error al cargar modelo STT: {e}")
    stt_model = None
    stt_processor = None

STT_SAMPLE_RATE = 16000


@app.get("/health")
def health():
    return {
        "status": "online" if (tts_model is not None or stt_model is not None) else "error",
        "tts": {"model": TTS_MODEL_ID, "loaded": tts_model is not None},
        "stt": {"model": STT_MODEL_ID, "loaded": stt_model is not None},
        "language": "Quechua Cusco (quz)",
    }


# ─── TTS endpoints ───────────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str


@app.post("/tts")
def synthesize_quechua_post(req: TTSRequest):
    return _generate_audio(req.text)


@app.get("/tts")
def synthesize_quechua(text: str = Query(..., description="Palabra o frase en Quechua")):
    return _generate_audio(text)


ACHAHALA_PHONEMES = {
    "a": "a a",
    "i": "i i",
    "u": "u u",
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
    if tts_model is None or tts_tokenizer is None:
        raise HTTPException(status_code=503, detail="Modelo TTS no disponible")

    clean_text = text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Texto vacío")

    lookup_key = clean_text.lower()
    spoken_text = ACHAHALA_PHONEMES.get(lookup_key, lookup_key)

    try:
        inputs = tts_tokenizer(spoken_text, return_tensors="pt")
        with torch.no_grad():
            output = tts_model(**inputs).waveform

        audio_arr = output.squeeze().cpu().numpy()
        sampling_rate = tts_model.config.sampling_rate

        peak = np.max(np.abs(audio_arr))
        if peak >= 0.035:
            audio_arr = (audio_arr / peak) * 0.85

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
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en síntesis: {str(e)}")


# ─── STT endpoint ────────────────────────────────────────────────────────────

@app.post("/stt")
async def transcribe_quechua(file: UploadFile = File(...)):
    """
    Recibe un clip de audio corto (cualquier formato soportado por ffmpeg:
    wav, m4a/aac, webm/opus) grabado desde la app, lo normaliza a 16kHz mono
    y lo transcribe con el modelo Quechua.
    """
    if stt_model is None or stt_processor is None:
        raise HTTPException(status_code=503, detail="Modelo STT no disponible")

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Archivo de audio vacío")

    try:
        audio_segment = AudioSegment.from_file(io.BytesIO(raw_bytes))
        audio_segment = audio_segment.set_frame_rate(STT_SAMPLE_RATE).set_channels(1)

        samples = np.array(audio_segment.get_array_of_samples()).astype(np.float32)
        max_amplitude = float(1 << (8 * audio_segment.sample_width - 1))
        samples = samples / max_amplitude

        if samples.size == 0:
            return {"transcript": "", "confidence": 0.0}

        inputs = stt_processor(
            samples, sampling_rate=STT_SAMPLE_RATE, return_tensors="pt", padding=True
        )

        with torch.no_grad():
            logits = stt_model(inputs.input_values).logits

        probs = torch.softmax(logits, dim=-1)
        confidence = float(torch.max(probs, dim=-1).values.mean())
        predicted_ids = torch.argmax(logits, dim=-1)
        transcript = stt_processor.batch_decode(predicted_ids)[0].strip().lower()

        return {"transcript": transcript, "confidence": round(confidence, 3)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al transcribir: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
