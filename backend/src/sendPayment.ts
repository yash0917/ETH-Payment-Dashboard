import "dotenv/config";
import { ethers } from "ethers";
import path from "path";
import fs from "fs";

/**
 * Optional helper script to call logPayment() from Node instead of Remix.
 * 
 * You must:
 * - Put a private key in PRIVATE_KEY in your .env (test wallet only!)
 * - Configure RPC_URL and CONTRACT_ADDRESS
 */

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!RPC_URL || !CONTRACT_ADDRESS || !PRIVATE_KEY) {
  console.error("Missing RPC_URL, CONTRACT_ADDRESS, or PRIVATE_KEY in .env");
  process.exit(1);
}

const abiPath = path.join(__dirname, "..", "abi", "PaymentLogger.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
const CONTRACT_ABI = abiJson.abi;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY as string, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS as string, CONTRACT_ABI, wallet);

  const to = process.argv[2];
  const amountStr = process.argv[3] || "1";

  if (!to) {
    console.error("Usage: ts-node src/sendPayment.ts <toAddress> [amount]");
    process.exit(1);
  }

  const amount = BigInt(amountStr);

  console.log(`Calling logPayment(to=${to}, amount=${amount})...`);
  const tx = await contract.logPayment(to, amount);
  console.log("Submitted tx:", tx.hash);
  const receipt = await tx.wait();
  console.log("Mined in block:", receipt.blockNumber);
}

main().catch((err) => {
  console.error("Error in sendPayment:", err);
});
