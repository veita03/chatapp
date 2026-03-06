import { ConvexHttpClient } from "convex/browser";
console.log("Starting test...");
const client = new ConvexHttpClient("https://festive-wildcat-934.eu-west-1.convex.cloud");
client.setAuth(async () => "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJrMTc1emV3N2c0N3duZnpoZWhlZXN2bjgxbjgyY3NxMnxqbjc1bmRwYW5oYmNrOGdldmIxNDFtNzcxOTgyY2p2NSIsImlhdCI6MTc3MjgyNzU0MSwiaXNzIjoiaHR0cHM6Ly9hcGkuc3BvcnQyZ28uYXBwIiwiYXVkIjoiY29udmV4IiwiZXhwIjoxNzcyODMxMTQxfQ.u0Sv1uN9QwwYmIfv7WFqaD-d_3g-SRHSnqE-f9V2ZBDuI02vhCBMh7nhMwRwON3mqTUd6pPZSzqMtw1qmxE1d6eMgZzXKqpVR5o1qLNh0LTa5SlEMRDhWitLwFI1a1H2UrclEwRCrl4Zz9btGftWvkgHUeDkXBkbntDs2_5d_ERkUw7hnlbI_H5fOQXYkt1BRSBcTfSwDvg3HDvho04FUoMcXOOH_tjvWvQ-o5qK1qg81Iv5QPN3vG9h8tXWaxU765D2PmNeXRfr_WY29i3v-Z9KQH7jy363ZAtqMP6XqFmJm0x5SWWE_-UdI68JVEn-Ys24N7vXkF2vg9EPNZfkzg");

async function run() {
  try {
    console.log("Calling query...");
    const res = await client.query("auth:isAuthenticated");
    console.log("Query returned:", res);
  } catch (e) {
    console.error("Error connecting/querying:", e);
  }
}
await run();
