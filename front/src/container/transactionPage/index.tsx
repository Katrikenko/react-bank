import React, { useEffect, useState, useContext } from "react";
import "./index.css";
import { BalanceState } from "../../component/balanceState";
import Back from "../../component/back-button";
import Divider from "../../component/divider";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../App";

const TransactionPage: React.FC = () => {
  //==========================================

  const { transactionId } = useParams<{ transactionId?: string }>();
  const [balanceState, setBalanceState] = useState<BalanceState | null>(null);

  const authContext = useContext(AuthContext);
  const userId = authContext.state.token;

  useEffect(() => {
    const getBalanceState = localStorage.getItem(`balanceState_${userId}`);
    if (getBalanceState) {
      setBalanceState(JSON.parse(getBalanceState));
    }
  }, []);

  if (!balanceState || !balanceState.notifications) {
    return <p className="title-dark">Loading ...</p>;
  }

  if (transactionId === undefined) {
    return <p className="title-dark">Transaction ID is missing</p>;
  }

  const index = parseInt(transactionId, 10);

  if (isNaN(index)) {
    return <p className="title-dark">Invalid ID</p>;
  }

  const transaction =
    balanceState.notifications[balanceState.notifications.length - 1 - index]; // display transactions in the correct order

  if (!transaction) {
    return <p className="title-dark">Transaction not found</p>;
  }

  return (
    <div className="page darker-page">
      <header className="header header-center">
        <Back />
        <h1 className="title-dark">Transaction</h1>
      </header>
      <main className="transaction__section">
        <p
          className={`transaction__amount ${
            transaction.type === "Sending" ? "sending-text" : "receiving-text"
          }`}>
          {transaction.type === "Sending" ? "-" : "+"}${transaction.amount}
        </p>
        <div className="transaction__context">
          <div className="transaction__card">
            <p>Date</p>
            <span>{transaction.paymentDate}</span>
          </div>
          <Divider className="divider" style={{ margin: "16px 0" }} />
          <div className="transaction__card">
            <p>Address</p>
            <span>{transaction.paymentMethod}</span>
          </div>
          <Divider className="divider" style={{ margin: "16px 0" }} />
          <div className="transaction__card">
            <p>Type</p>
            <span>{transaction.type}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionPage;
