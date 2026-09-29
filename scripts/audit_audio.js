const fs = require('fs');
const path = require('path');
const https = require('https');

const VOICE_SERVICE_URL = 'https://yessyess22--yachay-voice-service-voiceservice-web.modal.run';
const AUDIO_DIR = path.join(__dirname, '../assets/audio/quechua');

function testSTT(filePath) {
  return new Promise((resolve, reject) => {
    const fileBytes = fs.readFileSync(filePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let body = [];
    body.push(Buffer.from(`--${boundary}\r\n`));
    body.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\n`));
    body.push(Buffer.from('Content-Type: audio/wav\r\n\r\n'));
    body.push(fileBytes);
    body.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const totalBody = Buffer.concat(body);

    const req = https.request(`${VOICE_SERVICE_URL}/stt`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalBody.length,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: data });
        }
      });
    });

    req.on('error', reject);
    req.write(totalBody);
    req.end();
  });
}

async function audit() {
  const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.wav'));
  console.log(`Auditing ${files.length} audio files...`);

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const fullPath = path.join(AUDIO_DIR, f);
    try {
      const res = await testSTT(fullPath);
      results.push({ file: f, transcript: res.transcript, confidence: res.confidence });
      console.log(`[${i+1}/${files.length}] ${f.padEnd(30)} -> "${res.transcript}" (conf: ${res.confidence})`);
    } catch (err) {
      console.error(f, err.message);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'audit_results.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('Finished audit. Results saved to scripts/audit_results.json');
}

audit().catch(console.error);
