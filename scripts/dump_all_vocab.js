const fs = require('fs');
const path = require('path');

// 1. Achahala alphabet
const ACHAHALA = [
  { type: 'Vocal', letter: 'A', name: 'a', example: 'Allpa (Tierra)', sound: '/a/' },
  { type: 'Vocal', letter: 'I', name: 'i', example: 'Inti (Sol)', sound: '/i/' },
  { type: 'Vocal', letter: 'U', name: 'u', example: 'Urqu (Cerro)', sound: '/u/' },
  { type: 'Consonante', letter: 'CH', name: 'cha', example: 'Chaki (Pie)', sound: '/tʃ/' },
  { type: 'Consonante glotalizada', letter: "CH'", name: "ch'a", example: "Ch'aska (Estrella)", sound: '/tʃʼ/' },
  { type: 'Consonante', letter: 'H', name: 'ha / ja', example: 'Hampi (Medicina)', sound: '/h/' },
  { type: 'Consonante', letter: 'K', name: 'ka', example: 'Kachi (Sal)', sound: '/k/' },
  { type: 'Consonante aspirada', letter: 'KH', name: 'kha', example: 'Khuchi (Cerdo)', sound: '/kʰ/' },
  { type: 'Consonante glotalizada', letter: "K'", name: "k'a", example: "K'uychi (Arcoíris)", sound: '/kʼ/' },
  { type: 'Consonante', letter: 'L', name: 'la', example: 'Lawa (Sopa)', sound: '/l/' },
  { type: 'Consonante', letter: 'LL', name: 'lla', example: 'Llaqta (Pueblo)', sound: '/ʎ/' },
  { type: 'Consonante', letter: 'M', name: 'ma', example: 'Mama (Madre)', sound: '/m/' },
  { type: 'Consonante', letter: 'N', name: 'na', example: 'Nina (Fuego)', sound: '/n/' },
  { type: 'Consonante', letter: 'Ñ', name: 'ña', example: 'Ñawi (Ojo)', sound: '/ɲ/' },
  { type: 'Consonante', letter: 'P', name: 'pa', example: 'Pampa (Suelo)', sound: '/p/' },
  { type: 'Consonante aspirada', letter: 'PH', name: 'pha', example: 'Phuyu (Nube)', sound: '/pʰ/' },
  { type: 'Consonante glotalizada', letter: "P'", name: "p'a", example: "P'acha (Ropa)", sound: '/pʼ/' },
  { type: 'Consonante uvular', letter: 'Q', name: 'qa', example: 'Quri (Oro)', sound: '/q/' },
  { type: 'Consonante uvular aspirada', letter: 'QH', name: 'qha', example: 'Qhapaq (Poderoso/Rico)', sound: '/qʰ/' },
  { type: 'Consonante uvular glotalizada', letter: "Q'", name: "q'a", example: "Q'omer (Verde)", sound: '/qʼ/' },
  { type: 'Consonante', letter: 'R', name: 'ra', example: 'Rumi (Piedra)', sound: '/ɾ/' },
  { type: 'Consonante', letter: 'S', name: 'sa', example: 'Sara (Maíz)', sound: '/s/' },
  { type: 'Consonante', letter: 'T', name: 'ta', example: 'Tanta (Pan)', sound: '/t/' },
  { type: 'Consonante glotalizada', letter: "T'", name: "t'a", example: "T'ika (Flor)", sound: '/tʼ/' },
  { type: 'Consonante semivocal', letter: 'W', name: 'wa', example: 'Wasi (Casa)', sound: '/w/' },
  { type: 'Consonante semivocal', letter: 'Y', name: 'ya', example: 'Yaku (Agua)', sound: '/j/' }
];

// 2. Parse lessonContent.ts
const lessonsPath = path.join(__dirname, '../src/content/lessonContent.ts');
const lessonsStr = fs.readFileSync(lessonsPath, 'utf8');

const lessonCards = [];
const lessonRegex = /{\s*id:\s*['"]([^'"]+)['"],\s*quechua:\s*['"]([^'"]+)['"],\s*spanish:\s*['"]([^'"]+)['"],\s*phonetic:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = lessonRegex.exec(lessonsStr)) !== null) {
  lessonCards.push({ id: m[1], quechua: m[2], spanish: m[3], phonetic: m[4] });
}

// 3. Parse libraryData.ts
const libPath = path.join(__dirname, '../src/content/libraryData.ts');
const libStr = fs.readFileSync(libPath, 'utf8');

const libEntries = [];
// id: 'dict-1', category: '...', subCategory: '...', qu: '...', es: '...', phonetic: '...'
const entryRegex = /id:\s*['"]([^'"]+)['"],\s*category:\s*['"]([^'"]+)['"],\s*(?:subCategory:\s*['"]([^'"]+)['"],\s*)?qu:\s*['"]([^'"]+)['"],\s*es:\s*['"]([^'"]+)['"],\s*phonetic:\s*['"]([^'"]+)['"]/g;
while ((m = entryRegex.exec(libStr)) !== null) {
  libEntries.push({ id: m[1], category: m[2], subCategory: m[3] || '', qu: m[4], es: m[5], phonetic: m[6] });
}

// 4. Parse stories.ts
const storiesPath = path.join(__dirname, '../src/content/stories.ts');
const storiesStr = fs.readFileSync(storiesPath, 'utf8');
const storyTurns = [];
const storyRegex = /speaker:\s*['"]([^'"]+)['"],\s*quechua:\s*['"]([^'"]+)['"],\s*spanish:\s*['"]([^'"]+)['"]/g;
while ((m = storyRegex.exec(storiesStr)) !== null) {
  storyTurns.push({ speaker: m[1], quechua: m[2], spanish: m[3] });
}

// Output summary
const allData = {
  achahala: ACHAHALA,
  lessonCards,
  libEntries,
  storyTurns
};

fs.writeFileSync(path.join(__dirname, 'all_vocab.json'), JSON.stringify(allData, null, 2), 'utf8');
console.log('Saved all_vocab.json successfully.');
console.log('Achahala letters:', ACHAHALA.length);
console.log('Lesson cards:', lessonCards.length);
console.log('Library entries:', libEntries.length);
console.log('Story turns:', storyTurns.length);

