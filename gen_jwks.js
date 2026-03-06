const jose = require('jose');
const fs = require('fs');

async function run() {
  const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDd3Rxuqz6+2SzD
0xbhWpPA9v9pwrcf9ztAau98iMectbwpix9l23kvxElk+CyS+R6ZAw8gRrmIcw/Q
ZDE2zLfs/L/TuqqhYTBKWH60xLQkVeIJQ6x8JWfhwLvNrxjOgCvVnKJL4jqUgtTh
avru4WmB+zJhjw25AXm3jWf9gWzrHbfJfKTZQQkfZGdwHI6DmLrftG8BdveqeTPk
/gzuIgxif5Zm91Ma8+dJ6uwqZkmrzfR8Wzy1/RBKAaKsntx5JOuWmjdGHL7Vpx3P
Kfhc5X7odu0wFOtpDKa3geH1zG6J2v90K/zzZtaPx5u9aErBtzmi0ZlIk0WyAdkb
3ncVYs/1AgMBAAECggEAGbSg8vSd3jxo6p52R/F37ZNgp/cSwx4gzBenvEjXweEv
liujnWhWq/Fk5JE5juTUxfs8ASwYmoXkVuuI5TXGeKuXKTe3Rd/uGasTsSuaSJx3
xkWEQlUOKnKrf8sSB3kDuyn9BuhFC8h11FFSFiPhVtlNLs8FksIoQVtdqVpZzYrK
brs9dJIHe60bTp7B4sorXwbvcuINwH9jNGhfwAhferrtRMZ8vrbI6L04jqMEAPv3
HPGXmKx7jlJne7DvSLWM/uPLHlNN8EY1n7IIBWGZWDcldy4sBwprzDaNbBbEaaWw
cEM9b2lX9Xrfsr//sPaFUkCXXIXe5LOoyZ7+vzbPaQKBgQD0REo1xOVXWyTIiubZ
T+pIthk4ygu5AF+3lI04GJaxHslYemFb1/dTRlyoS7fjJOsFXnixPQVNh/k3jgyF
EdYkh8v01l7tt3miRf1zQsRt5o9c8GR0kKgba1o6cFH//FLRuKi0yLTrciS3QTRb
/K92gXoFY0Vi2fD6CshEYOpv3QKBgQDohVWgDBtu9H+2PBjw5k46j66zCnPc1Soo
qvo6ZIwW4Vqfq+nWatPL+Fu1jONk97ZARzhSGVOXI282Blv2GYJrtho5xJgba9VO
fzbuKIeMwvGUMv3Fr+U2Em7SBZGcOuDV5nm5x0M2xJGzYn9jDzpf267kvzDlDurE
K5W+P8zq+QKBgQDZb1in2GdWhZmOsqaf1xV0ODTnamNZAU4y+pdi0fCCJieRDQ9R
VEOi60VbwlskZR6YHupMy0bHJzzfCSF36tK2nfMeNR03elVZ7/eW/F4iflQrpQmn
AYXDMqKU1psHxbJrYXc7xlXWKDsqrW5QW/RNByB5X07Kmbp6udJfm+3UOQKBgQCZ
aoghbnuXTNkK+0IViE9rUiwZU7c4qKkFZjJt3rOT0SLDIWHLKHcQKJESC6BpmQt2
A8fEW5OMsEOLaMy6ZwBnYyKQpQcbaJ24CjXLE5DELkfI2ZAZJEJe1/CowCXf5/U7
DLOaAUB23WGo8z9Ls9t3LfKKWR/AsoPx5TQK7/ubuQKBgAVY+mhIfNUmlwgKcvGn
FSfc6a+63XcY7utko0VW40jdelphHwQLcQbnwW07eRzgRuV22+YRELUMYWFSjn2/
medGvtGd1CggaVBwFtTW5AX76iu8A6RbjPyNuC1ImKkBDjmzKjHS18cp4h86ho/+
/Ns0LldJze2C2+tVGhyzUCbd
-----END PRIVATE KEY-----`;

  const privateKey = await jose.importPKCS8(privateKeyPem, 'RS256');
  const jwk = await jose.exportJWK(privateKey);
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  const jwks = JSON.stringify({ keys: [jwk] });
  fs.writeFileSync('jwks.json', jwks);
}

run().catch(console.error);
