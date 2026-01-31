export interface BalanceData {
  balance: number;
  withdrawableBalance: number;
  storeCredit: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalContributed: number;
  totalProfitReceived: number;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface TransactionsData {
  transactions: Transaction[];
}
