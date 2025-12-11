import { useState, useEffect, useMemo } from 'react';
import { ConnectWallet } from './components/ConnectWallet';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function App() {
  const [stats, setStats] = useState({
    txCount: 0,
    totalAmount: 0,
    uniqueSenders: 0,
    uniqueReceivers: 0,
    topSenders: [],
    volumeByDay: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [txError, setTxError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  // Layout toggles
  const [showGlobalTx, setShowGlobalTx] = useState(true);
  const [showPersonalTx, setShowPersonalTx] = useState(true);

  const fetchStats = async () => {
    try {
      setStatsError(null);
      const res = await fetch(`${API_BASE}/api/stats`);
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats({
        txCount: data.txCount ?? 0,
        totalAmount: data.totalAmount ?? 0,
        uniqueSenders: data.uniqueSenders ?? 0,
        uniqueReceivers: data.uniqueReceivers ?? 0,
        topSenders: data.topSenders ?? [],
        volumeByDay: data.volumeByDay ?? []
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStatsError("Failed to load analytics.");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxError(null);
      const res = await fetch(`${API_BASE}/api/transactions?limit=50`);
      if (!res.ok) throw new Error("Failed to load transactions");
      const payload = await res.json();
      setTransactions(payload.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTxError("Failed to load transactions.");
    } finally {
      setLoadingTx(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchStats(), fetchTransactions()]);
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter transactions for connected wallet
  const personalTransactions = useMemo(() => {
    if (!walletAddress) return [];
    const normalizedAddr = walletAddress.toLowerCase();
    return transactions.filter(tx =>
      tx.fromAddr?.toLowerCase() === normalizedAddr ||
      tx.toAddr?.toLowerCase() === normalizedAddr
    );
  }, [walletAddress, transactions]);

  // Calculate personal stats
  const personalStats = useMemo(() => {
    if (!walletAddress) return null;

    const uniqueSenders = new Set(personalTransactions.map(tx => tx.fromAddr.toLowerCase())).size;
    const uniqueReceivers = new Set(personalTransactions.map(tx => tx.toAddr.toLowerCase())).size;
    const totalAmount = personalTransactions.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);

    return {
      txCount: personalTransactions.length,
      totalAmount,
      uniqueSenders,
      uniqueReceivers
    };
  }, [personalTransactions, walletAddress]);

  const shortenAddress = (addr, chars = 4) => {
    if (!addr) return "";
    return `${addr.slice(0, 2 + chars)}...${addr.slice(-chars)}`;
  };

  const formatTs = (ts) => {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    return d.toLocaleString();
  };

  // Helper component for transaction tables
  const TransactionsTable = ({ data, loading }) => {
    if (loading) return <tr><td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>Loading transactions...</td></tr>;
    if (data.length === 0) return <tr><td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>No transactions found.</td></tr>;

    return data.map((row) => (
      <tr key={row.id || row.txHash}>
        <td className="tx-hash" title={row.txHash}>
          <a
            href={`https://sepolia.etherscan.io/tx/${row.txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none' }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            {shortenAddress(row.txHash, 6)}
          </a>
        </td>
        <td>{row.blockNumber}</td>
        <td className="addr" title={row.fromAddr}>
          <a
            href={`https://sepolia.etherscan.io/address/${row.fromAddr}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontFamily: 'monospace' }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            {shortenAddress(row.fromAddr)}
          </a>
        </td>
        <td className="addr" title={row.toAddr}>
          <a
            href={`https://sepolia.etherscan.io/address/${row.toAddr}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontFamily: 'monospace' }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            {shortenAddress(row.toAddr)}
          </a>
        </td>
        <td>{row.amount}</td>
        <td className="timestamp">{formatTs(row.timestamp)}</td>
      </tr>
    ));
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>USDC Micro-Payments Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Live analytics from the PaymentLogger contract on Ethereum Sepolia.</p>
        </div>
        <ConnectWallet setGlobalAddress={setWalletAddress} />
      </header>

      {/* Testnet Banner - Production Only */}
      {import.meta.env.PROD && (
        <div style={{
          marginBottom: '24px',
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor: '#fffbeb', // yellow-50
          border: '1px solid #fef3c7', // yellow-200
          color: '#92400e', // yellow-800
          fontSize: '0.875rem'
        }}>
          <strong>Testnet:</strong> This dashboard reads Sepolia testnet data and does not represent real USDC or real funds.
        </div>
      )}

      {/* 1. Global Contract Stats */}
      <section className="mb-6" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '16px', color: '#f1f5f9' }}>Global Contract Stats</h2>
        {loadingStats ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading global stats...</p>
        ) : statsError ? (
          <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{statsError}</p>
        ) : (
          <div className="stats">
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">{stats.txCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Amount (raw units)</div>
              <div className="stat-value">{stats.totalAmount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unique Senders</div>
              <div className="stat-value">{stats.uniqueSenders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unique Receivers</div>
              <div className="stat-value">{stats.uniqueReceivers}</div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Global Recent Transactions (Collapsible) */}
      <section className="table-section" style={{ marginBottom: '32px' }}>
        <div className="table-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f1f5f9', margin: 0 }}>All Contract Transactions</h2>
          <button
            onClick={() => setShowGlobalTx(!showGlobalTx)}
            style={{
              background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
              padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
            }}
          >
            {showGlobalTx ? "Hide" : "Show"}
          </button>
        </div>

        {showGlobalTx && (
          <>
            {txError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '12px' }}>{txError}</p>}
            <table>
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Block</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody id="global-tx-table-body">
                <TransactionsTable data={transactions} loading={loadingTx} />
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* 3. Analytics Charts */}
      <section className="analytics-section" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f1f5f9', margin: 0 }}>Analytics</h2>
          <button id="refresh-btn" onClick={refreshAll} style={{ marginLeft: 'auto' }}>Refresh All Data</button>
        </div>

        {loadingStats ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading charts...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="chart-container" style={{ background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: '#94a3b8' }}>Volume Over Time</h3>
              {stats.volumeByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.volumeByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Line type="monotone" dataKey="totalAmount" stroke="#818cf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No volume data available
                </div>
              )}
            </div>
            <div className="chart-container" style={{ background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: '#94a3b8' }}>Top Senders</h3>
              {stats.topSenders.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topSenders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="address" tickFormatter={(addr) => shortenAddress(addr)} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                      labelFormatter={(addr) => shortenAddress(addr)}
                    />
                    <Bar dataKey="totalAmount" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No sender data available
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. My Activity (Connected Wallet) */}
      {walletAddress && personalStats && (
        <section className="mb-6" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#10b981' }}>My Activity (connected wallet)</h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{shortenAddress(walletAddress)}</span>
          </div>
          <div className="stats">
            <div className="stat-card" style={{ borderColor: '#059669' }}>
              <div className="stat-label" style={{ color: '#6ee7b7' }}>My Transactions</div>
              <div className="stat-value">{personalStats.txCount}</div>
            </div>
            <div className="stat-card" style={{ borderColor: '#059669' }}>
              <div className="stat-label" style={{ color: '#6ee7b7' }}>My Total Amount</div>
              <div className="stat-value">{personalStats.totalAmount}</div>
            </div>
            <div className="stat-card" style={{ borderColor: '#059669' }}>
              <div className="stat-label" style={{ color: '#6ee7b7' }}>Senders I Received From</div>
              <div className="stat-value">{personalStats.uniqueSenders}</div>
            </div>
            <div className="stat-card" style={{ borderColor: '#059669' }}>
              <div className="stat-label" style={{ color: '#6ee7b7' }}>Receivers I Sent To</div>
              <div className="stat-value">{personalStats.uniqueReceivers}</div>
            </div>
          </div>
        </section>
      )}

      {/* 5. My Recent Transactions (Collapsible, Connected Wallet) */}
      {walletAddress && (
        <section className="table-section" style={{ marginBottom: '32px' }}>
          <div className="table-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f1f5f9', margin: 0, marginBottom: '4px' }}>My Recent Transactions</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Showing transactions involving <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{shortenAddress(walletAddress)}</span>
              </p>
            </div>
            <button
              onClick={() => setShowPersonalTx(!showPersonalTx)}
              style={{
                background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
                padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
              }}
            >
              {showPersonalTx ? "Hide" : "Show"}
            </button>
          </div>

          {showPersonalTx && (
            <table>
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Block</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody id="personal-tx-table-body">
                <TransactionsTable data={personalTransactions} loading={loadingTx} />
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
