import "dotenv/config";
import axios from "axios";

/**
 * Optional script to demonstrate calling Circle's sandbox APIs.
 * You need to:
 * - Create a Circle sandbox account
 * - Generate an API key
 * - Put it in your .env as CIRCLE_API_KEY
 */

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;

if (!CIRCLE_API_KEY) {
  console.error("Missing CIRCLE_API_KEY in .env");
  process.exit(1);
}

const client = axios.create({
  baseURL: "https://api-sandbox.circle.com/v1",
  headers: {
    Authorization: `Bearer ${CIRCLE_API_KEY}`,
    "Content-Type": "application/json"
  }
});

async function main() {
  try {
    // Example: list configuration or balances, tweak as needed
    const res = await client.get("/businessAccount/balances");
    console.log("Circle balances response:");
    console.dir(res.data, { depth: null });
  } catch (err: any) {
    console.error("Error calling Circle API:", err.response?.data || err.message);
  }
}

main();
