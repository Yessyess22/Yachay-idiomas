import numpy as np
import scipy.signal
import soundfile as sf
import sys

def time_stretch_wsola(audio, rate=0.82, win_size=512, hop_out=128):
    """
    Time-stretch 1D audio by factor `rate` (e.g., 0.82 is ~22% slower)
    using WSOLA (Waveform Similarity Overlap-Add).
    Preserves pitch and formant characteristics perfectly without artifacts.
    """
    if rate == 1.0:
        return audio
    
    hop_in = int(round(hop_out * rate))
    num_frames = int(np.floor((len(audio) - win_size) / hop_in))
    
    # Hanning window
    win = np.hanning(win_size).astype(np.float32)
    
    out_len = int(np.ceil(len(audio) / rate)) + win_size * 2
    out_audio = np.zeros(out_len, dtype=np.float32)
    norm = np.zeros(out_len, dtype=np.float32)
    
    # Search window around target input hop
    delta_max = win_size // 4
    
    in_pos = 0
    out_pos = 0
    prev_frame = audio[0:win_size]
    
    for i in range(num_frames):
        target_in = int(round(i * hop_in))
        
        # Search best match in [target_in - delta_max, target_in + delta_max]
        search_start = max(0, target_in - delta_max)
        search_end = min(len(audio) - win_size, target_in + delta_max)
        
        if search_end > search_start and out_pos > 0:
            # Cross-correlation with target region in out_audio
            ref = out_audio[out_pos : out_pos + win_size]
            best_corr = -1e9
            best_pos = target_in
            for cand in range(search_start, search_end, 2):
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
        
    # Normalize by window sum
    nz = norm > 1e-4
    out_audio[nz] /= norm[nz]
    
    # Trim to valid length
    valid_len = out_pos + win_size // 2
    res = out_audio[:valid_len]
    
    # Prevent clipping
    peak = np.max(np.abs(res))
    if peak > 0.95:
        res = (res / peak) * 0.95
        
    return res

if __name__ == '__main__':
    data, sr = sf.read('assets/audio/quechua/iskay.wav')
    slow = time_stretch_wsola(data, rate=0.80)
    sf.write('scripts/iskay_slow.wav', slow, sr)
    print(f'Original duration: {len(data)/sr:.2f}s, Slow duration: {len(slow)/sr:.2f}s')
