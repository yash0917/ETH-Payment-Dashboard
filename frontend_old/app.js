const API_BASE = "http://localhost:4000";

async function fetchStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  const data = await res.json();
  document.getElementById("stat-txCount").innerText = data.txCount ?? 0;
  document.getElementById("stat-totalAmount").innerText = data.totalAmount ?? 0;
  document.getElementById("stat-uniqueSenders").innerText = data.uniqueSenders ?? 0;
  document.getElementById("stat-uniqueReceivers").innerText = data.uniqueReceivers ?? 0;
}

function formatAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatHash(hash) {
  if (!hash) return "";
  return hash.slice(0, 10) + "..." + hash.slice(-6);
}

function formatTs(ts) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

async function fetchTransactions() {
  const tbody = document.getElementById("tx-table-body");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>`;

  const res = await fetch(`${API_BASE}/api/transactions?limit=50`);
  const payload = await res.json();
  const rows = payload.data || [];

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No transactions yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  for (const row of rows) {
    const tr = document.createElement("tr");

    const txTd = document.createElement("td");
    txTd.textContent = formatHash(row.txHash);
    txTd.title = row.txHash;
    txTd.className = "tx-hash";
    tr.appendChild(txTd);

    const blockTd = document.createElement("td");
    blockTd.textContent = row.blockNumber;
    tr.appendChild(blockTd);

    const fromTd = document.createElement("td");
    fromTd.textContent = formatAddr(row.fromAddr);
    fromTd.title = row.fromAddr;
    fromTd.className = "addr";
    tr.appendChild(fromTd);

    const toTd = document.createElement("td");
    toTd.textContent = formatAddr(row.toAddr);
    toTd.title = row.toAddr;
    toTd.className = "addr";
    tr.appendChild(toTd);

    const amountTd = document.createElement("td");
    amountTd.textContent = row.amount;
    tr.appendChild(amountTd);

    const tsTd = document.createElement("td");
    tsTd.textContent = formatTs(row.timestamp);
    tsTd.className = "timestamp";
    tr.appendChild(tsTd);

    tbody.appendChild(tr);
  }
}

async function refreshAll() {
  await Promise.all([fetchStats(), fetchTransactions()]);
}

document.getElementById("refresh-btn").addEventListener("click", () => {
  refreshAll().catch(console.error);
});

refreshAll().catch(console.error);
setInterval(() => {
  refreshAll().catch(console.error);
}, 15000);
