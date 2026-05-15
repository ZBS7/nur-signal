const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors({ origin: '*' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'NUR signaling server running', peers: 0 });
});

const server = app.listen(PORT, () => {
  console.log(`NUR signaling server running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/nur',
  allow_discovery: false,
  proxied: true,
  alive_timeout: 60000,
  key: 'nur',
  concurrent_limit: 5000,
});

app.use('/nur', peerServer);

peerServer.on('connection', (client) => {
  console.log(`[NUR] Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`[NUR] Peer disconnected: ${client.getId()}`);
});
