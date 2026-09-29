import requests
import soundfile as sf
import numpy as np
import os

VOICE_URL = 'https://yessyess22--yachay-voice-service-voiceservice-web.modal.run'
AUDIO_DIR = 'assets/audio/quechua'

def get_tts(text):
    r = requests.get(f'{VOICE_URL}/tts', params={'text': text}, timeout=10)
    audio_path = 'scripts/temp_dl.wav'
    with open(audio_path, 'wb') as f:
        f.write(r.content)
    data, sr = sf.read(audio_path)
    return data, sr

def get_stt(data, sr):
    sf.write('scripts/temp_stt.wav', data, sr)
    with open('scripts/temp_stt.wav', 'rb') as f:
        r = requests.post(f'{VOICE_URL}/stt', files={'file': ('t.wav', f, 'audio/wav')}, timeout=10)
        return r.json()

def time_stretch_simple(audio, rate=0.78):
    """Simple, artifact-free WSOLA time-stretch (rate=0.78 = ~28% slower)"""
    win_size = 512
    hop_out = 128
    hop_in = int(round(hop_out * rate))
    num_frames = int(np.floor((len(audio) - win_size) / hop_in))
    win = np.hanning(win_size).astype(np.float32)
    out_len = int(np.ceil(len(audio) / rate)) + win_size * 2
    out_audio = np.zeros(out_len, dtype=np.float32)
    norm = np.zeros(out_len, dtype=np.float32)
    delta_max = win_size // 4
    
    out_pos = 0
    for i in range(num_frames):
        target_in = int(round(i * hop_in))
        search_start = max(0, target_in - delta_max)
        search_end = min(len(audio) - win_size, target_in + delta_max)
        if search_end > search_start and out_pos > 0:
            ref = out_audio[out_pos : out_pos + win_size]
            best_corr = -1e9
            best_pos = target_in
            for cand in range(search_start, search_end, 3):
                frame = audio[cand : cand + win_size]
                corr = np.dot(ref, frame)
                if corr > best_corr:
                    best_corr = corr
                    best_pos = cand
            in_pos = best_pos
        else:
            in_pos = target_in
            
        frame = audio[in_pos : in_pos + win_size] * win
        out_audio[out_pos : out_pos + win_size] += frame
        norm[out_pos : out_pos + win_size] += win
        out_pos += hop_out
        
    nz = norm > 1e-4
    out_audio[nz] /= norm[nz]
    res = out_audio[:out_pos + win_size // 2]
    peak = np.max(np.abs(res))
    if peak > 0.95:
        res = (res / peak) * 0.95
    return res

# 1. FIX SOQTA: Slower and with the full ending syllable "-ta"
print("Generating complete SOQTA...")
data_soqta_full, sr = get_tts("soqta killa")
# Energy detection: soqta is from start of speech to the pause before killa
abs_s = np.abs(data_soqta_full)
speech = np.where(abs_s > 0.04)[0]
start = max(0, speech[0] - int(sr * 0.05))
# find the gap after soqta (usually around 0.8s)
end = int(sr * 0.95)
soqta_trimmed = data_soqta_full[start:end]
soqta_slow = time_stretch_simple(soqta_trimmed, rate=0.80)
pad = np.zeros(int(sr * 0.1), dtype=np.float32)
soqta_final = np.concatenate([pad, soqta_slow, pad])
sf.write(os.path.join(AUDIO_DIR, 'soqta.wav'), soqta_final, sr)
print("Saved soqta.wav, STT:", get_stt(soqta_final, sr))

# 2. FIX LETTER PH: "pha" (puff of air + a)
print("\nGenerating letter PH (pha)...")
data_pha, sr = get_tts("pha")
# If direct "pha" is short, check "p-ha" or "pha pacha"
pha_trimmed = data_pha[int(sr * 0.08):int(sr * 0.65)]
pha_slow = time_stretch_simple(pha_trimmed, rate=0.82)
pha_final = np.concatenate([pad, pha_slow, pad])
sf.write(os.path.join(AUDIO_DIR, 'letter_ph.wav'), pha_final, sr)
print("Saved letter_ph.wav, STT:", get_stt(pha_final, sr))

# 3. FIX PHUYU: "phuyu" (nube)
print("\nGenerating PHUYU...")
data_phuyu_phrase, sr = get_tts("hanaq phuyu")
# "phuyu" is the second word in "hanaq phuyu" (from 0.70s to end)
phuyu_trimmed = data_phuyu_phrase[int(sr * 0.68):int(sr * 1.35)]
phuyu_slow = time_stretch_simple(phuyu_trimmed, rate=0.80)
phuyu_final = np.concatenate([pad, phuyu_slow, pad])
sf.write(os.path.join(AUDIO_DIR, 'phuyu.wav'), phuyu_final, sr)
print("Saved phuyu.wav, STT:", get_stt(phuyu_final, sr))
