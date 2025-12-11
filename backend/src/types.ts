export interface PaymentRow {
  id: number;
  txHash: string;
  logIndex?: number;
  blockNumber: number;
  fromAddr: string;
  toAddr: string;
  amount: string;
  timestamp: number;
  createdAt: number;
}
