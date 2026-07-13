const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return null; }
}

function writeJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

app.get('/api/content', (req, res) => {
  const q = req.query.translated;
  const data = readJSON(CONTENT_FILE) || { content: [] };
  let list = data.content || [];
  if (typeof q !== 'undefined') {
    const want = q === '1' || q === 'true' || q === 'yes';
    list = list.filter(i => !!i.translated === want);
  }
  res.json({ ok: true, items: list });
});

app.post('/api/analytics/choice', (req, res) => {
  const { choice, userId, ts } = req.body || {};
  if (!choice) return res.status(400).json({ ok: false, message: 'choice required' });

  const analytics = readJSON(ANALYTICS_FILE) || {};
  analytics[choice] = analytics[choice] || { count: 0, last: null };
  analytics[choice].count += 1;
  analytics[choice].last = ts || Date.now();

  writeJSON(ANALYTICS_FILE, analytics);
  res.json({ ok: true, choice, count: analytics[choice].count });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TanzaFlix backend listening on http://localhost:${PORT}`));
