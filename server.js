const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 9000;
const METERED_KEY = process.env.METERED_KEY || '';
const METERED_DOMAIN = 'nnurr.metered.live';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'NUR signaling server running', time: new Date().toISOString() });
});

// ICE servers endpoint — returns TURN credentials
app.get('/ice-servers', (req, res) => {
  if (!METERED_KEY) {
    console.log('[NUR] No METERED_KEY set, returning STUN only');
    return res.json([
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]);
  }

  // Correct Metered.ca API endpoint with secretKey parameter
  const url = `https://${METERED_DOMAIN}/api/v1/turn/credentials?secretKey=${METERED_KEY}`;
  console.log('[NUR] Fetching ICE servers from Metered...');

  https.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('[NUR] Got', parsed.length, 'ICE servers from Metered');
        res.json(parsed);
      } catch (e) {
        console.error('[NUR] Metered parse error:', e, 'Raw:', data.slice(0, 200));
        res.json([{ urls: 'stun:stun.l.google.com:19302' }]);
      }
    });
  }).on('error', (e) => {
    console.error('[NUR] Metered fetch error:', e.message);
    res.json([{ urls: 'stun:stun.l.google.com:19302' }]);
  });
});

const server = app.listen(PORT, () => {
  console.log(`NUR signaling server on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/',
  proxied: true,
  alive_timeout: 60000,
  key: 'peerjs',
});

app.use('/nur', peerServer);

peerServer.on('connection', (client) => {
  console.log('[NUR] Peer connected:', client.getId());
});
peerServer.on('disconnect', (client) => {
  console.log('[NUR] Peer disconnected:', client.getId());
});
