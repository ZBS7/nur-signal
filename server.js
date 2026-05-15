const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.json({ status: 'NUR signaling server running' });
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
  console.log('Peer connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
  console.log('Peer disconnected:', client.getId());
});
