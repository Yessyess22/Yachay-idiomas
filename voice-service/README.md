# Yachay Voice Service

Microservicio de voz en Quechua para la app **Yachay**. Expone tres endpoints:

- `POST /tts` y `GET /tts?text=...` — síntesis de voz Quechua auténtica con
  [`facebook/mms-tts-quz`](https://huggingface.co/facebook/mms-tts-quz) (Meta MMS).
- `POST /stt` — reconocimiento de voz Quechua con
  [`ivangtorre/wav2vec2-xlsr-300m-quechua`](https://huggingface.co/ivangtorre/wav2vec2-xlsr-300m-quechua),
  recibe un archivo de audio (`multipart/form-data`, campo `file`) en cualquier
  formato que entienda ffmpeg (wav, m4a, webm) y devuelve `{ transcript, confidence }`.
- `GET /health` — estado de ambos modelos.

Hay dos versiones del mismo servicio en esta carpeta:

- **`modal_app.py`** — la que se despliega (ver instrucciones abajo). Corre en
  [Modal](https://modal.com), gratis en la práctica: da $30/mes de crédito y
  solo cobra por segundo mientras el contenedor está atendiendo una petición
  (se apaga solo cuando nadie lo usa).
- **`app.py`** — la misma lógica en FastAPI "plano", útil para correrla en tu
  laptop durante desarrollo (`python app.py`) sin depender de Modal ni de
  internet una vez descargados los modelos.

## Desplegar en Modal (recomendado)

1. Instala el CLI de Modal y crea cuenta (no pide tarjeta):
   ```bash
   pip install modal
   modal setup
   ```
   Esto abre el navegador para loguearte/crear cuenta y guarda tus
   credenciales localmente.

2. Despliega el servicio:
   ```bash
   cd voice-service
   modal deploy modal_app.py
   ```
   La primera vez, Modal construye la imagen y descarga ambos modelos
   (~2.7 GB) para "hornearlos" dentro de la imagen — tarda varios minutos.
   Al terminar, imprime una URL pública fija, algo como:
   ```
   https://TU_USUARIO--yachay-voice-service-voiceservice-web.modal.run
   ```

3. Verifica que responde:
   ```bash
   curl https://TU_USUARIO--yachay-voice-service-voiceservice-web.modal.run/health
   ```

4. En la app, define esa URL en `.env`:
   ```
   EXPO_PUBLIC_VOICE_SERVICE_URL=https://TU_USUARIO--yachay-voice-service-voiceservice-web.modal.run
   ```

### Notas sobre Modal

- El contenedor se apaga tras `scaledown_window` (20 min sin uso, configurado
  en `modal_app.py`) y se apaga sin costo — el primer request después de
  estar dormido tarda unos segundos más (cold start) mientras arranca de
  nuevo, pero los modelos ya vienen descargados dentro de la imagen, así que
  no hay que volver a bajarlos.
- Si haces cambios al código, solo vuelve a correr `modal deploy modal_app.py`.
- El modelo de reconocimiento (`wav2vec2-xlsr-300m-quechua`) fue entrenado
  con habla continua real, no con fonemas sueltos. Funciona mejor con
  palabras/frases completas que con letras aisladas.

## Desarrollo local (sin Modal)

```bash
cd voice-service
pip install -r requirements.txt
python app.py   # sirve en http://localhost:8000
```

## Alternativas si prefieren no usar Modal

- **Hugging Face Spaces (Docker)**: usa `Dockerfile` + `app.py` de esta
  carpeta. Desde julio de 2026, Docker Spaces con hardware gratis requieren
  una suscripción **PRO** (~$9/mes); con esa suscripción, sube estos archivos
  a un Space nuevo con SDK "Docker".
- **Render.com**: tiene tier gratis con Docker, pero solo 512 MB de RAM —
  insuficiente para tener ambos modelos cargados a la vez (~2.7 GB). No
  recomendado sin antes cuantizar/reducir los modelos.
- **Servidor propio** (Oracle Cloud "Always Free", una VM propia, etc.): usa
  `Dockerfile` + `app.py` igual que con un Space, corriendo `docker build` y
  `docker run` directamente en esa máquina.
