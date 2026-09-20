"""
Yachay Voice Service — versión para desplegar en Modal (modal.com).

Misma lógica que app.py (TTS + STT en Quechua), mp portada a la forma en que
Modal necesita el código: una imagen con las dependencias, una clase con un
método `@modal.enter()` que carga los modelos una sola vez por contenedor, y
un método `@modal.asgi_app()` que expone la app FastAPI de siempre.

Deploy:
    pip install modal
    modal setup                 # login (abre el navegador)
    modal deploy modal_app.py   # imprime la URL pública al terminar
"""
import io

import modal

TTS_MODEL_ID = "facebook/mms-tts-quz"
STT_MODEL_ID = "ivangtorre/wav2vec2-xlsr-300m-quechua"
HF_CACHE_DIR = "/model_cache"

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


def _download_models():
    """Se ejecuta UNA vez al construir la imagen: descarga y "hornea" los
    modelos dentro del contenedor para que los arranques en frío no tengan
    que volver a bajar ~2.7 GB desde Hugging Face cada vez."""
    import os

    os.environ["HF_HOME"] = HF_CACHE_DIR
    from transformers import AutoTokenizer, VitsModel, Wav2Vec2ForCTC, Wav2Vec2Processor

    AutoTokenizer.from_pretrained(TTS_MODEL_ID)
    VitsModel.from_pretrained(TTS_MODEL_ID)
    Wav2Vec2Processor.from_pretrained(STT_MODEL_ID)
    Wav2Vec2ForCTC.from_pretrained(STT_MODEL_ID)


image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install(
        "fastapi[standard]",
        "torch",
        "transformers",
        "soundfile",
        "numpy",
        "pydub",
        "sentencepiece",
    )
    .env({"HF_HOME": HF_CACHE_DIR})
    .run_function(_download_models)
)

app = modal.App("yachay-voice-service", image=image)


@app.cls(scaledown_window=1200)
class VoiceService:
    @modal.enter()
    def load_models(self):
        import torch
        from transformers import AutoTokenizer, VitsModel, Wav2Vec2ForCTC, Wav2Vec2Processor

        self.torch = torch
        self.tts_tokenizer = AutoTokenizer.from_pretrained(TTS_MODEL_ID)
        self.tts_model = VitsModel.from_pretrained(TTS_MODEL_ID).eval()
        self.stt_processor = Wav2Vec2Processor.from_pretrained(STT_MODEL_ID)
        self.stt_model = Wav2Vec2ForCTC.from_pretrained(STT_MODEL_ID).eval()

    def _generate_audio(self, text: str):
        import numpy as np
        import soundfile as sf
        from fastapi import HTTPException
        from fastapi.responses import StreamingResponse

        clean_text = text.strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="Texto vacío")

        spoken_text = ACHAHALA_PHONEMES.get(clean_text.lower(), clean_text.lower())

        inputs = self.tts_tokenizer(spoken_text, return_tensors="pt")
        with self.torch.no_grad():
            output = self.tts_model(**inputs).waveform

        audio_arr = output.squeeze().cpu().numpy()
        sampling_rate = self.tts_model.config.sampling_rate

        peak = np.max(np.abs(audio_arr))
        if peak >= 0.035:
            audio_arr = (audio_arr / peak) * 0.85

        pad_intro = np.zeros(int(sampling_rate * 0.12), dtype=np.float32)
        pad_outro = np.zeros(int(sampling_rate * 0.18), dtype=np.float32)
        audio_arr = np.concatenate([pad_intro, audio_arr, pad_outro])

        buf = io.BytesIO()
        sf.write(buf, audio_arr, sampling_rate, format="WAV")
        buf.seek(0)
        return StreamingResponse(buf, media_type="audio/wav")

    async def _transcribe(self, raw_bytes: bytes):
        import numpy as np
        from fastapi import HTTPException
        from pydub import AudioSegment

        if not raw_bytes:
            raise HTTPException(status_code=400, detail="Archivo de audio vacío")

        audio_segment = AudioSegment.from_file(io.BytesIO(raw_bytes))
        audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
        samples = np.array(audio_segment.get_array_of_samples()).astype(np.float32)
        max_amplitude = float(1 << (8 * audio_segment.sample_width - 1))
        samples = samples / max_amplitude

        if samples.size == 0:
            return {"transcript": "", "confidence": 0.0}

        inputs = self.stt_processor(samples, sampling_rate=16000, return_tensors="pt", padding=True)
        with self.torch.no_grad():
            logits = self.stt_model(inputs.input_values).logits

        probs = self.torch.softmax(logits, dim=-1)
        confidence = float(self.torch.max(probs, dim=-1).values.mean())
        predicted_ids = self.torch.argmax(logits, dim=-1)
        transcript = self.stt_processor.batch_decode(predicted_ids)[0].strip().lower()
        return {"transcript": transcript, "confidence": round(confidence, 3)}

    @modal.asgi_app()
    def web(self):
        from fastapi import FastAPI, File, Query, UploadFile
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel

        web_app = FastAPI(title="Yachay Voice Service (Modal)")
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class TTSRequest(BaseModel):
            text: str

        @web_app.get("/health")
        def health():
            return {"status": "online", "tts": TTS_MODEL_ID, "stt": STT_MODEL_ID}

        @web_app.get("/tts")
        def synth_get(text: str = Query(..., description="Palabra o frase en Quechua")):
            return self._generate_audio(text)

        @web_app.post("/tts")
        def synth_post(req: TTSRequest):
            return self._generate_audio(req.text)

        @web_app.post("/stt")
        async def stt(file: UploadFile = File(...)):
            raw_bytes = await file.read()
            return await self._transcribe(raw_bytes)

        return web_app
