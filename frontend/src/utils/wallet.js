export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error("MetaMask not installed");
    }
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });
    return accounts[0];
}

export async function getCurrentWallet() {
    if (!window.ethereum) return null;
    const accounts = await window.ethereum.request({
        method: "eth_accounts"
    });
    return accounts.length ? accounts[0] : null;
}
