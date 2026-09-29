const fs = require('fs');
const path = require('path');
const https = require('https');

const { getAudioEntries, ACHAHALA_LETTERS } = require('./extract_vocab');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'audio', 'quechua');
const ASSETS_TS_PATH = path.join(__dirname, '..', 'src', 'services', 'quechuaAudioAssets.ts');
const VOICE_SERVICE_URL = 'https://yessyess22--yachay-voice-service-voiceservice-web.modal.run';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadAudio(text, outputPath) {
  return new Promise((resolve, reject) => {
    const url = `${VOICE_SERVICE_URL}/tts?text=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status ${res.statusCode} for "${text}"`));
      }
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function testSTT(filePath) {
  return new Promise((resolve) => {
    try {
      const fileBytes = fs.readFileSync(filePath);
      const boundary = '----Boundary' + Math.random().toString(36).substring(2);

      const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.wav"\r\nContent-Type: audio/wav\r\n\r\n`);
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
      const totalBody = Buffer.concat([head, fileBytes, tail]);

      const req = https.request(`${VOICE_SERVICE_URL}/stt`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': totalBody.length,
        },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ transcript: '', confidence: 0 });
          }
        });
      });

      req.on('error', () => resolve({ transcript: '', confidence: 0 }));
      req.on('timeout', () => { req.destroy(); resolve({ transcript: '', confidence: 0 }); });
      req.write(totalBody);
      req.end();
    } catch (e) {
      resolve({ transcript: '', confidence: 0 });
    }
  });
}

function normalizeForComparison(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_'`~()¿?¡!\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function computeMatchScore(transcript, targetWord) {
  const t = normalizeForComparison(transcript);
  const w = normalizeForComparison(targetWord);
  if (!t || !w) return 0;
  if (t === w) return 1.0;
  if (t.includes(w) || w.includes(t)) return 0.85;

  const longer = t.length > w.length ? t : w;
  const shorter = t.length > w.length ? w : t;
  const dist = levenshtein(longer, shorter);
  return (longer.length - dist) / longer.length;
}

function generatePhoneticCandidates(word) {
  const candidates = new Set();
  const lower = word.toLowerCase().trim();

  // 1. Semivocales y glides iniciales
  if (lower.startsWith('i')) {
    candidates.add(`y${lower}`);
    candidates.add(`y-${lower}`);
  }
  if (lower.startsWith('u')) {
    candidates.add(`w${lower}`);
    candidates.add(`hu${lower.slice(1)}`);
  }
  if (lower.startsWith('a')) {
    candidates.add(`ha${lower.slice(1)}`);
  }

  // 2. Fonema 'H' en quechua (siempre es fricativa velar [x], sonido de 'J' en español)
  if (lower.startsWith('h')) {
    candidates.add(`j${lower.slice(1)}`);
  }
  if (lower.includes('h') && !lower.includes('ch') && !lower.includes('ph') && !lower.includes('kh') && !lower.includes('qh') && !lower.includes('th') && !lower.includes('sh')) {
    candidates.add(lower.replace(/h/g, 'j'));
  }

  // 3. Aspiradas y fonemas achahala
  if (lower.includes('ph')) candidates.add(lower.replace(/ph/g, 'pha'));
  if (lower.includes('kh')) candidates.add(lower.replace(/kh/g, 'kha'));
  if (lower.includes('qh')) candidates.add(lower.replace(/qh/g, 'qha'));
  if (lower.includes('th')) candidates.add(lower.replace(/th/g, 'tha'));

  // 4. Modulación de pausa y pitch
  candidates.add(`${lower}.`);

  // 5. Separación silábica
  if (lower.length >= 4) {
    const mid = Math.floor(lower.length / 2);
    candidates.add(`${lower.slice(0, mid)} ${lower.slice(mid)}`);
  }

  // 6. Variantes quechua comunes
  if (lower.includes('q')) candidates.add(lower.replace(/q/g, 'k'));
  if (lower.includes('k')) candidates.add(lower.replace(/k/g, 'q'));

  candidates.delete(lower);
  return Array.from(candidates);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const args = process.argv.slice(2);
  const filterArg = args.find(a => !a.startsWith('--'))?.toLowerCase();
  const forceFlag = args.includes('--force');

  const entries = getAudioEntries();
  console.log(`Starting audio generation for ${entries.length} dictionary entries...`);

  // Map unique spokenText to filename
  const spokenToFilename = new Map();
  // Map normalized key to filename
  const keyToFilename = new Map();

  for (const entry of entries) {
    const normalizedSpoken = entry.spokenText.toLowerCase().trim();
    if (!spokenToFilename.has(normalizedSpoken)) {
      const filename = `${entry.slug}.wav`;
      spokenToFilename.set(normalizedSpoken, filename);
    }
    keyToFilename.set(entry.key, spokenToFilename.get(normalizedSpoken));
  }

  let uniqueFilesToDownload = Array.from(spokenToFilename.entries());
  if (filterArg) {
    uniqueFilesToDownload = uniqueFilesToDownload.filter(([spoken, file]) =>
      file.toLowerCase().includes(filterArg) || spoken.toLowerCase().includes(filterArg)
    );
    console.log(`Filtro activo para "${filterArg}": ${uniqueFilesToDownload.length} archivo(s) a procesar.`);
  }

  console.log(`Unique audio clips to verify/download: ${uniqueFilesToDownload.length}`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < uniqueFilesToDownload.length; i++) {
    const [spokenText, filename] = uniqueFilesToDownload[i];
    const filePath = path.join(OUTPUT_DIR, filename);

    // Skip if already generated and non-empty (> 1KB) unless force or filter is used
    if (!forceFlag && !filterArg && fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      skipCount++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${uniqueFilesToDownload.length}] Sintetizando "${spokenText}" -> ${filename}... `);
    try {
      await downloadAudio(spokenText, filePath);

      // Auto-auditoría con STT en Quechua
      const stt = await testSTT(filePath);
      const score = computeMatchScore(stt.transcript, spokenText);

      if (score >= 0.70) {
        console.log(`✓ (STT verificado: "${stt.transcript}", conf: ${stt.confidence})`);
        successCount++;
      } else {
        process.stdout.write(`\n  ⚠️ Pronunciación dudosa (STT entendió: "${stt.transcript}"). Auto-corrigiendo fonética... `);
        const candidates = generatePhoneticCandidates(spokenText);
        let bestCandidate = null;
        let bestScore = score;
        let bestStt = stt;
        const tempPath = path.join(OUTPUT_DIR, `temp_${filename}`);

        for (const cand of candidates) {
          try {
            await downloadAudio(cand, tempPath);
            const candStt = await testSTT(tempPath);
            const candScore = computeMatchScore(candStt.transcript, spokenText);
            if (candScore > bestScore) {
              bestScore = candScore;
              bestCandidate = cand;
              bestStt = candStt;
              fs.copyFileSync(tempPath, filePath);
            }
          } catch (e) {}
        }
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

        if (bestCandidate && bestScore > score) {
          console.log(`✓ Corregido automáticamente con "${bestCandidate}" (STT: "${bestStt.transcript}", conf: ${bestStt.confidence})`);
        } else {
          console.log(`✓ Manteniendo versión disponible`);
        }
        successCount++;
      }
      await sleep(150);
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      errorCount++;
      await sleep(1000);
    }
  }

  console.log('\n--- Generation Summary ---');
  console.log(`Total: ${uniqueFilesToDownload.length}`);
  console.log(`Generated: ${successCount}`);
  console.log(`Skipped (already exists): ${skipCount}`);
  console.log(`Failed: ${errorCount}`);

  generateTsMap(keyToFilename);
}

function generateTsMap(keyToFilename) {
  const existingFiles = new Set(fs.readdirSync(OUTPUT_DIR));

  const validEntries = [];
  for (const [key, filename] of keyToFilename.entries()) {
    if (existingFiles.has(filename)) {
      validEntries.push({ key, filename });
    }
  }

  console.log(`\nGenerating TypeScript manifest with ${validEntries.length} audio mappings...`);

  const uniqueFilenames = Array.from(new Set(validEntries.map(e => e.filename))).sort();

  const fileRequires = uniqueFilenames
    .map(f => `  '${f}': require('@/assets/audio/quechua/${f}'),`)
    .join('\n');

  const keyMap = validEntries
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(e => `  ${JSON.stringify(e.key)}: AUDIO_FILES[${JSON.stringify(e.filename)}],`)
    .join('\n');

  // Build Achahala letter audio map
  const letterMap = ACHAHALA_LETTERS
    .map(item => {
      const filename = `${item.slug}.wav`;
      if (existingFiles.has(filename)) {
        return `  ${JSON.stringify(item.letter.toLowerCase())}: AUDIO_FILES[${JSON.stringify(filename)}],`;
      }
      return null;
    })
    .filter(Boolean)
    .join('\n');

  const code = `/**
 * quechuaAudioAssets.ts
 * Generado automáticamente por scripts/generate_mms_audio.js
 * Mapeo de vocabulario, fonemas del alfabeto y cuentos Quechua a audios pregrabados con MMS-TTS (Meta).
 */

const AUDIO_FILES: Record<string, any> = {
${fileRequires}
};

export const QUECHUA_PRE_RECORDED_AUDIO: Record<string, any> = {
${keyMap}
};

/**
 * Mapeo específico de las 25 letras del Achahala a su fonema individual.
 */
export const QUECHUA_LETTER_AUDIO: Record<string, any> = {
${letterMap}
};

/**
 * Normaliza texto para búsqueda en la biblioteca de audios.
 */
export function normalizeQuechuaAudioKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,\\/#!$%\\^&\\*;:{}=\\-_'\\\`~()¿?¡!]/g, '')
    .replace(/\\s+/g, ' ');
}

/**
 * Busca si existe un audio pregrabado para el texto dado.
 * Retorna el asset (require) o null si debe sintetizarse en vivo.
 */
export function getPreRecordedQuechuaAudio(text: string): any | null {
  if (!text) return null;
  const key = normalizeQuechuaAudioKey(text);
  if (QUECHUA_PRE_RECORDED_AUDIO[key]) {
    return QUECHUA_PRE_RECORDED_AUDIO[key];
  }

  // Intenta sin paréntesis si venía en formato "CH (Chaki)" o "Q' (Q'omer)"
  const parenMatch = text.match(/^([A-Za-zÑñ'\\s]{1,6})\\s*\\((.+?)\\)/);
  if (parenMatch) {
    const innerWord = normalizeQuechuaAudioKey(parenMatch[2]);
    if (QUECHUA_PRE_RECORDED_AUDIO[innerWord]) {
      return QUECHUA_PRE_RECORDED_AUDIO[innerWord];
    }
  }

  return null;
}

/**
 * Para tarjetas con formato "LETRA (Palabra)" (ej: "Q' (Q'omer)"):
 * Retorna el audio de la letra exterior y el audio de la palabra interior de forma independiente.
 */
export function getPreRecordedTeachingPair(text: string): { letterAudio: any; wordAudio: any } | null {
  if (!text) return null;
  const parenMatch = text.match(/^([A-Za-zÑñ'\\s]{1,6})\\s*\\((.+?)\\)/);
  if (!parenMatch) return null;

  const letterKey = normalizeQuechuaAudioKey(parenMatch[1]);
  const wordKey = normalizeQuechuaAudioKey(parenMatch[2]);

  const letterAudio = QUECHUA_LETTER_AUDIO[letterKey] || QUECHUA_PRE_RECORDED_AUDIO[letterKey];
  const wordAudio = QUECHUA_PRE_RECORDED_AUDIO[wordKey];

  if (letterAudio && wordAudio) {
    return { letterAudio, wordAudio };
  }
  return null;
}
`;

  fs.writeFileSync(ASSETS_TS_PATH, code, 'utf8');
  console.log(`TypeScript map written to: ${ASSETS_TS_PATH}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
