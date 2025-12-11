import "dotenv/config";
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import { db } from "./db";
import path from "path";
import fs from "fs";
import { PaymentRow } from "./types";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !CONTRACT_ADDRESS) {
  console.error("Missing required env vars: RPC_URL or CONTRACT_ADDRESS");
  process.exit(1);
}

// Load ABI from JSON file
const abiPath = path.join(__dirname, "..", "abi", "PaymentLogger.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
const CONTRACT_ABI = abiJson.abi;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

const app = express();
app.use(cors());
app.use(express.json());

// --- Event subscription: listen for PaymentLogged events and store in DB ---
async function startEventListener() {
  console.log("Subscribing to PaymentLogged events on", CONTRACT_ADDRESS);

  contract.on(
    "PaymentLogged",
    async (from: string, to: string, amount: bigint, timestamp: bigint, event: any) => {
      try {
        const txHash = event.log.transactionHash;
        const blockNumber = event.log.blockNumber;
        const logIndex = event.log.index; // ethers v6
        const createdAt = Date.now();

        const stmt = db.prepare(
          `INSERT INTO payments (txHash, logIndex, blockNumber, fromAddr, toAddr, amount, timestamp, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );

        stmt.run(
          txHash,
          logIndex,
          blockNumber,
          from,
          to,
          amount.toString(),
          Number(timestamp),
          createdAt,
          (err: any) => {
            if (err) {
              if (err.message && err.message.includes("UNIQUE constraint failed")) {
                console.log(`Ignoring duplicate event: ${txHash} logIndex=${logIndex}`);
              } else {
                console.error("Failed to insert payment:", err);
              }
            } else {
              console.log("Payment inserted:", {
                txHash,
                logIndex,
                from,
                to,
                amount: amount.toString(),
                timestamp: Number(timestamp)
              });

              // Update indexer state
              db.run(
                `UPDATE indexer_state SET lastBlockNumber = ?, lastEventTimestamp = ? WHERE id = 1`,
                [blockNumber, Number(timestamp)],
                (updateErr) => {
                  if (updateErr) console.error("Failed to update indexer state:", updateErr);
                }
              );
            }
          }
        );

        stmt.finalize();
      } catch (err) {
        console.error("Error handling PaymentLogged event:", err);
      }
    }
  );
}

// --- API Routes ---

// List recent transactions
app.get("/api/transactions", (req, res) => {
  const limit = Number(req.query.limit) || 50;

  db.all<PaymentRow>(
    `SELECT * FROM payments ORDER BY id DESC LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        console.error("Failed to query payments:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json({ data: rows });
    }
  );
});

// Basic aggregate stats
app.get("/api/stats", (req, res) => {
  db.all<any>(
    `SELECT 
        COUNT(*) as txCount,
        COALESCE(SUM(CAST(amount AS REAL)), 0) as totalAmount
      FROM payments`,
    (err, rows) => {
      if (err) {
        console.error("Failed to query basic stats:", err);
        return res.status(500).json({ error: "DB error" });
      }
      const basicStats = rows[0];

      // Unique addresses
      db.all<any>(
        `SELECT COUNT(DISTINCT fromAddr) as uniqueSenders,
                COUNT(DISTINCT toAddr) as uniqueReceivers
         FROM payments`,
        (err2, rows2) => {
          if (err2) {
            console.error("Failed to query unique addresses:", err2);
            return res.status(500).json({ error: "DB error" });
          }
          const uniqueStats = rows2[0];

          // Top Senders
          db.all<any>(
            `SELECT fromAddr as address, SUM(CAST(amount AS REAL)) as totalAmount
             FROM payments
             GROUP BY fromAddr
             ORDER BY totalAmount DESC
             LIMIT 5`,
            (err3, topSenders) => {
              if (err3) {
                console.error("Failed to query top senders:", err3);
                return res.status(500).json({ error: "DB error" });
              }

              // Volume by Day
              // SQLite doesn't have a direct 'date' function on int timestamp unless converted
              // timestamp is in seconds (unix epoch)
              db.all<any>(
                `SELECT 
                   strftime('%Y-%m-%d', datetime(timestamp, 'unixepoch')) as date,
                   SUM(CAST(amount AS REAL)) as totalAmount
                 FROM payments
                 GROUP BY date
                 ORDER BY date ASC`,
                (err4, volumeByDay) => {
                  if (err4) {
                    console.error("Failed to query volume by day:", err4);
                    return res.status(500).json({ error: "DB error" });
                  }

                  res.json({
                    txCount: basicStats.txCount,
                    totalAmount: basicStats.totalAmount,
                    uniqueSenders: uniqueStats.uniqueSenders,
                    uniqueReceivers: uniqueStats.uniqueReceivers,
                    topSenders: topSenders,
                    volumeByDay: volumeByDay
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Healthcheck
app.get("/api/health", (_req, res) => {
  db.get("SELECT * FROM indexer_state WHERE id = 1", (err, row: any) => {
    if (err) {
      console.error("Health check DB error:", err);
      return res.status(500).json({ status: "error", error: "DB error" });
    }

    res.json({
      status: "ok",
      network: "sepolia",
      contractAddress: CONTRACT_ADDRESS,
      lastBlockNumber: row ? row.lastBlockNumber : null,
      lastEventTimestamp: row ? row.lastEventTimestamp : null
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
  startEventListener().catch((err) => {
    console.error("Failed to start event listener:", err);
  });
});
