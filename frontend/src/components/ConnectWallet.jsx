import { useState, useEffect } from 'react';
import { connectWallet, getCurrentWallet } from '../utils/wallet';

export function ConnectWallet({ setGlobalAddress }) {
    const [address, setAddress] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check initial connection
        getCurrentWallet().then(addr => {
            setAddress(addr);
            setGlobalAddress(addr);
        });

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                const addr = accounts[0] || null;
                setAddress(addr);
                setGlobalAddress(addr);
                setError(null);
            });
        }
    }, [setGlobalAddress]);

    const handleConnect = async () => {
        try {
            setError(null);
            const addr = await connectWallet();
            setAddress(addr);
            setGlobalAddress(addr);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to connect");
        }
    };

    const formatAddr = (addr) => {
        if (!addr) return "";
        return addr.slice(0, 6) + "..." + addr.slice(-4);
    };

    return (
        <div className="connect-wallet-container">
            {error && <span className="wallet-error" style={{ color: '#ef4444', marginRight: '10px', fontSize: '0.9rem' }}>{error}</span>}

            {!address ? (
                <button onClick={handleConnect} className="connect-btn">
                    Connect Wallet
                </button>
            ) : (
                <div className="wallet-info" style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid #374151',
                    fontSize: '0.9rem',
                    color: '#e5e7eb'
                }}>
                    <span style={{ color: '#10b981', marginRight: '6px' }}>●</span>
                    {formatAddr(address)}
                </div>
            )}
        </div>
    );
}
