/**
 * Simple TURN/STUN server using node-turn
 * Runs alongside the PeerJS signaling server
 */
const Turn = require('node-turn');

const PORT = parseInt(process.env.TURN_PORT || '3478');
const REALM = process.env.TURN_REALM || 'nur.messenger';
const USER = process.env.TURN_USER || 'nuruser';
const PASS = process.env.TURN_PASS || 'nurpass2024';

const server = new Turn({
  authMech: 'long-term',
  credentials: { [USER]: PASS },
  realm: REALM,
  listeningPort: PORT,
  debugLevel: 'ERROR',
});

server.start();
console.log(`TURN server running on port ${PORT}`);
console.log(`User: ${USER}, Realm: ${REALM}`);
