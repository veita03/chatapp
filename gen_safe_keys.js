const jose = require('jose');
const fs = require('fs');

async function run() {
  const { publicKey, privateKey } = await jose.generateKeyPair('RS256');
  
  const privateKeyPkcs8 = await jose.exportPKCS8(privateKey);
  fs.writeFileSync('private_key.pem', privateKeyPkcs8);

  const publicJwk = await jose.exportJWK(publicKey);
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  
  const jwks = JSON.stringify({ keys: [publicJwk] });
  fs.writeFileSync('public_jwks.json', jwks);
}

run().catch(console.error);
