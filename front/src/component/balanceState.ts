export interface BalanceState {
	balance: string;
	transactions: Transaction[];

}



export interface Transaction {
	amount: string;
	paymentMethod: string | null;
	paymentTime: string;
	paymentDate: string;
	type: string;
	transactionId?: number;
}

export interface TransactionPageProps {
	transactionData: Transaction | null;
	receiptData: Transaction | null;
	amount: string;
	type: string;
  }



export const getBalanceState: BalanceState = {
	balance: "0.00",
	transactions: [],
  };



