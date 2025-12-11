# ETH Payment Dashboard (Sepolia Testnet)

A full-stack Ethereum analytics dashboard for tracking on-chain payments. It listens to a `PaymentLogger` smart contract on the Sepolia testnet and visualizes global and per-wallet activity, offering both real-time transaction lists and historical analytics charts.

**Note:** This is a testnet application. No real funds are involved.

## Tech Stack
-   **Smart Contract**: Solidity (deployed on Sepolia)
-   **Backend**: Node.js, Express, TypeScript, SQLite, Ethers.js
-   **Frontend**: React, Vite, Recharts, Ethers.js
-   **Blockchain**: Ethereum Sepolia Testnet

## Deployed Contract
-   **Network**: Sepolia
-   **Contract**: `PaymentLogger`
-   **Address**: `0x2A7cB6097E510104d629cEb37f44595D880Fc192`
-   **RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com` (or your own provider)

## Prerequisites
-   Node.js (v18+)
-   npm or yarn
-   MetaMask (browser extension for testing "Connect Wallet")
-   Sepolia ETH (for making test transactions)

## Setup Instructions

Clone the repository:
```bash
git clone https://github.com/yash0917/ETH-Payment-Dashboard.git
cd ETH-Payment-Dashboard
```

### Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` and ensure `RPC_URL` and `CONTRACT_ADDRESS` are correct.

4.  Start the backend (dev mode):
    ```bash
    npm run dev
    ```

### Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    ```bash
    cp .env.example .env
    ```
    Ensure `VITE_API_BASE_URL` points to your running backend (default: `http://localhost:4000`).

4.  Start the frontend (dev mode):
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 Interactive Demo: Try it Yourself!

Want to see the dashboard light up? You can send a test transaction on the Sepolia testnet and watch it appear in real-time.

### Step 1: Get Ready (MetaMask & Testnet ETH)
1.  **Install MetaMask**: Download the [MetaMask browser extension](https://metamask.io/).
2.  **Create Account**: Follow the prompts to set up a new wallet.
3.  **Get Sepolia ETH (Free)**: You need "gas" to send transactions.
    *   Go to [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/#/).
    *   Paste your MetaMask address.
    *   Start Mining (it takes a few minutes to get enough ETH).

### Step 2: Connect via Remix IDE
Since this dashboard is for analytics, we use **Remix** to simulate the payment sending.

1.  Open [Remix Ethereum IDE](https://remix.ethereum.org).
2.  Create a new file (e.g., `JoyRide.sol`) and paste this code:
    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    contract PaymentLogger {
        function logPayment(address to, uint256 amount) external {}
    }
    ```
3.  **Compile**: Press `Ctrl + S` (or Cmd + S).
4.  **Connect Wallet**:
    *   Click the **"Deploy & Run Transactions"** icon (left sidebar, logo with ETH symbol).
    *   Change **"Environment"** to **"Injected Provider - MetaMask"**.
    *   Approve the connection in your MetaMask pop-up.

### Step 3: Send a Test Payment
1.  In the **"At Address"** box, paste the contract address:
    `0x2A7cB6097E510104d629cEb37f44595D880Fc192`
2.  Click **"At Address"** (button next to the box).
3.  Expand the loaded contract.
4.  You will see `logPayment`. Fill it in:
    *   **to**: `0xd1818022104F1193454b622be8c2D8B02b69cD45` (My Test Wallet)
    *   **amount**: `100` (Any number you want)
5.  Click **"transact"**.
6.  Confirm in MetaMask.

**🎉 Now look at the dashboard! Your transaction will appear in the "Global Stats" and "Recent Transactions" within seconds.**

---

## Demo Flow
1.  **Start Services**: Ensure both backend (`npm run dev`) and frontend (`npm run dev`) are running.
2.  **Open Dashboard**: Navigate to [http://localhost:5173](http://localhost:5173). Notice the testnet banner and global stats.
3.  **Connect Wallet**: Click "Connect Wallet" (top right), select a MetaMask account.
4.  **Simulate Traffic**: Use Remix or a script to `logPayment` on the contract.
5.  **Observe Updates**: Click "Refresh". See the "Global Stats" increment and "Analytics" charts update.
6.  **Personal View**: See "My Activity" section appear and the table filter to your address.

## How It Works
1.  **Event Listening**: The backend connects to the Sepolia RPC and subscribes to `PaymentLogged` events from the smart contract.
2.  **Indexing**: When an event is detected, it is extracted, de-duplicated (using unique transaction hash + log index), and stored in a local SQLite database.
3.  **Visualization**: The frontend fetches aggregated stats and recent transactions from the backend API.
4.  **Wallet Integration**: Users can connect their MetaMask wallet to view their personal transaction history and activity charts alongside global metrics.

## Deployment Notes
This project is ready for deployment on free tier services.

### Backend (Render / Railway / Fly.io)
-   **Build Command**: `npm install && npm run build`
-   **Start Command**: `npm start`
-   **Environment Variables**:
    -   `RPC_URL`: `https://ethereum-sepolia-rpc.publicnode.com` (or similar)
    -   `CONTRACT_ADDRESS`: `0x2A7cB6097E510104d629cEb37f44595D880Fc192`
    -   `PORT`: `4000` (or leave empty if provided by host)

### Frontend (Netlify / Vercel)
-   **Build Command**: `npm run build`
-   **Publish Directory**: `dist`
-   **Environment Variables**:
    -   `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://my-backend.onrender.com`).
    -   `VITE_CONTRACT_ADDRESS`: `0x2A7cB6097E510104d629cEb37f44595D880Fc192`
