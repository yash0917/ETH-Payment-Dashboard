# ETH Payment Dashboard (Sepolia Testnet)

**[🚀 Live Demo](https://eth-payment-dashboard-45cksgees-yash-aggarwals-projects.vercel.app/)** | **[📄 Smart Contract](https://sepolia.etherscan.io/address/0x2A7cB6097E510104d629cEb37f44595D880Fc192)**

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

This dashboard is **LIVE**! You can send a test transaction on the Sepolia testnet right now and watch it appear on the dashboard in real-time.

### Step 1: Get Ready
You need a crypto wallet and some fake "test" money.

1.  **Use Google Chrome**: This works best on Chrome.
2.  **Install MetaMask Extension**: [Click here to install from Chrome Web Store](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn).
3.  **Enable Test Networks**:
    *   **First, turn on the setting**: Click the **3 bars** (top right) -> **Settings** -> **Advanced**. Scroll down and toggle **"Show test networks"** to **ON**.
    *   **Then, select the network**: Go back to the main screen. Click the **All Popular Networks** button -> **Custom** tab -> Select **Sepolia**.
4.  **Get Free Sepolia ETH**:
    *   **Copy Address**: Hover over the icons under your account name and copy the address for **Ethereum**.
    *   Go to [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/#/).
    *   Paste your address and click "Start Mining". **Wait ~2 mins** until you have **0.05 ETH minimum**, then you can Stop Mining and Claim Rewards.

### Step 2: Connect to the Contract
We will use a developer tool called Remix to send the payment.

1.  Open [Remix Ethereum IDE](https://remix.ethereum.org).
2.  **Create File**: Click **"Create new blank file"** and name it `PaymentLogger.sol`.
3.  **Copy Code**: Copy the content of the `contracts/PaymentLogger.sol` file from this repository and paste it into Remix.
4.  **Compile**: Press `Ctrl + S` (or Cmd + S) to save and compile.
5.  **Connect Wallet**:
    *   Click the **"Deploy & Run Transactions"** icon (left sidebar, looks like the Ethereum logo).
    *   **Environment**: Change this drop-down to **"Injected Provider - MetaMask"**.
    *   MetaMask will pop up -> Click **Confirm/Connect**.

### Step 3: Send a Test Payment
1.  **Load Contract**:
    *   In the "At Address" box (under "Deploy and Verify"), paste this address:
        `0x2A7cB6097E510104d629cEb37f44595D880Fc192`
    *   Click the **"At Address"** button.
2.  **Send Transaction**:
    *   **Expand the Loaded Contract**: Look at the "Deployed Contracts" section (bottom left) and click the arrow `>` to expand the contract you just loaded.
    *   You will see a `logPayment` orange button. Expand it (click the caret).
    *   **to**: `0xd1818022104F1193454b622be8c2D8B02b69cD45` (This is my test wallet - send it here!)
    *   **amount**: `100` (Any number)
    *   Click **"transact"**.
3.  **Confirm**: MetaMask will pop up again. Click **"Confirm"**.

**🎉 Watch the Dashboard!**
Go to the [Live Dashboard](https://eth-payment-dashboard.vercel.app). Within 15 seconds, your transaction will appear in "Recent Transactions" and the "Global Volume" chart will jump up!

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

## Deployment Status
This project is currently deployed and live! I used **Vercel** for the frontend and **Railway** for the backend.

-> **[View Live Dashboard](https://eth-payment-dashboard-45cksgees-yash-aggarwals-projects.vercel.app/)** <-

### Deployment Config (Reference)
If you fork this repo, here are the settings used:

#### Backend (Railway)
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
