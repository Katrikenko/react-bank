export interface BalanceState {
	balance: string;
	notifications: Notification[];
}

export interface Notification {
	amount: string;
	paymentMethod: string | null;
	paymentTime: string;
	paymentDate: string;
	type: string;
	transactionId?: number;
}


const getUser = localStorage.getItem("user");
const user = getUser ? JSON.parse(getUser) : null;
const token = user ? user.token : null;


export const getBalanceState: BalanceState = {
	balance: "0.00",
	notifications: [],
  };



