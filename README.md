# USDC Micro-Payments Dashboard

A full-stack Ethereum analytics dashboard for micro-payments. It listens to a `PaymentLogger` smart contract on the Sepolia testnet and visualizes global and per-wallet payment activity, offering both real-time transaction lists and historical analytics charts.

## Tech Stack
-   **Smart Contract**: Solidity (deployed on Sepolia)
-   **Backend**: Node.js, Express, TypeScript, SQLite, Ethers.js
-   **Frontend**: React, Vite, Recharts, Ethers.js
-   **Blockchain**: Ethereum Sepolia Testnet

## Deployed Contract
-   **Network**: Sepolia
-   **Contract**: `PaymentLogger`
-   **Address**: `0x1EB79c9E744EF73E9F2AdDE383A0cf0f4db7307c`
-   **RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com` (or your own provider)

## Prerequisites
-   Node.js (v18+)
-   npm or yarn
-   MetaMask (browser extension for testing "Connect Wallet")
-   Sepolia ETH (for making test transactions)

## Setup Instructions

Clone the repository:
```bash
git clone <repo-url>
cd usdc-micropayments-dashboard
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
    -   `CONTRACT_ADDRESS`: `0x1EB79c9E744EF73E9F2AdDE383A0cf0f4db7307c`
    -   `PORT`: `4000` (or leave empty if provided by host)

### Frontend (Netlify / Vercel)
-   **Build Command**: `npm run build`
-   **Publish Directory**: `dist`
-   **Environment Variables**:
    -   `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://my-backend.onrender.com`).
    -   `VITE_CONTRACT_ADDRESS`: `0x1EB79c9E744EF73E9F2AdDE383A0cf0f4db7307c`

---

**Note on Circle Integration**: This project layout includes placeholders for Circle API credentials in `.env.example`, but the current implementation relies natively on Ethereum events and does not actively use the Circle Developer Platform API. Future iterations may integrate Circle for programmable wallets or stablecoin transfers.
