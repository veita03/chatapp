import { importPKCS8, SignJWT } from "jose";
import { execSync } from "child_process";

async function run() {
  const privateKey = await importPKCS8(`-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDpi1vqajJVlPK8
OvwBVPPEpJYezgELwfbnLryRC1S9erIqsF5I9cRHVvKsRMT+mMgN6rIPzEvU+lOy
MxtZD7sYlRAc7SF0Mh+VprMQHgW6R/ZUTCZMSjksznePjaVwheBcV82jGthg56x+
hPAbrcQRsYIsuZ7+2m30WEX69mQ4oYBO/HfwCFv4hqyZ7lIsqNPsMPypDuAeCj8v
tCD2G3Z6aAXz7HZ+EAe7DzTE8bGoS4SXa0TBoB13/Gd67OiO9yNhix3bcR8E9iL4
6OeHfRMk0fGM1bXmoSk2vCq1vObK/bD2G9YRPd1xdU0DW0L4hlXdxuTmdfUQb603
3i5854bXAgMBAAECggEAKSmd3rgu/PSOv+xphFaTzIHxz6YhexAJ039iTvI/UlIw
2uNRCuz+VlCV3xUT34fQItvN3Ij2iKhCXjMxy8XBBTkoqOCGt/Mpq/fAscOI4OdU
HFF7opCmeSY+3ndpxGZkQAJdxTSzFIlg1r/ZjhdXaoLt3bItut+G570zQGNzEKPY
Mu9zLeOg6j/UyyVWob5sbdDKYVNVI70V2j7YZrsUhp0l3aeOUiKpxtTcaKIUv7Nq
ETG9Q7hT0QwtFn5fDgTkPgQVXZOHZpvK0Yi6gCgPHMvII5rCxrUS0joCzwvaEStJ
K9KeZrK4VnhfOGiQb+c7L0z1TK8szFTk4zdbAQYRmQKBgQD/Livnm57ndgv3TvTf
P3SPqwwGbJPBRjTeh122MR14BY+zebBOnouio/7hsxpx13rMtR4umn7/EaFd9POF
VDQj3/XE/+9AviVo5HkERMn87prWyni/X8up3Y7oSlSpVFutnQfGSQ2ljEFb98Gi
SNthClK3Uv/hBbwjFYjT+Za/pQKBgQDqS2WVG/2BaTg4L4MVYGHDN/bWUc7GH+xk
Mj1nQUqatZx+puIcFubdfQq2R9cV7uiSBE2FBaaXk5bwja0z4bEEt2i5sX1H94kW
g0KQggzLgUKWEDNJ9VyzHQ2tTvU8Zi4vEoRxcgoqFXUP5obhrb87sK10e2eBvECq
gt5E5WIjywKBgBC9K54exDa0tKY9ZKy8Ud4Wv0wwlSSpgVBTmt8Xq7Iy0zFXuyv9
FHXPwil2ATcUhnalLtypv8jllCtApTTKyDzONSX+D+i0UGnoCtQv2vwffsK2N2N+
WjLDWNt9/L26zeS+l0L3idChOaxZvTbzBokAD1r9M9HD+YpnoDkfdzcNAoGANrVK
UAoMJNaz6PK3MhuiWFpOCfdqR/sWUMMmcWDekceMdkpzi8mROPDEupGF2LpDlizp
CQGrx8MPwLXkVrQBiK9nBc07Cr3zRc16kpG7eR2CtdWslD112uES24APZX4alKVH
RdIyK2d9QSw8HKBcggycRBG4tqOFmgsa6Y2CYAcCgYAxwf5JFw7YoLSDS1lvXVLr
8cN3wRfFzzrRGtFpe5IKQyq+9+w03VNq+d2M56/cbBxyYQNVmTnQ/EFrUUJGFtPG
ykVdcAUiPjlCo41PUYRxMsAdfUbo8rc1DO9GxSuqYYEhVMnHUcbFoTHJCARtrfFW
IVRAakfA1YMVoGr3b7B7qw==
-----END PRIVATE KEY-----`, "RS256");

  const token = await new SignJWT({
    sub: "testuser|testsession"
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setIssuer("https://api.sport2go.app")
    .setAudience("convex")
    .setExpirationTime(new Date(Date.now() + 1000 * 60 * 60))
    .sign(privateKey);

    const body = JSON.stringify({
      path: "auth:isAuthenticated",
      args: {},
      format: "json"
    });

    const res = execSync(`curl -s -X POST https://festive-wildcat-934.eu-west-1.convex.cloud/api/query \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${token}" \
      -d '${body}'`).toString();
      
    console.log("CURL Result:", res);
}

await run();
