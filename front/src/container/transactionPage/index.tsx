import React, { useEffect, useState, useContext } from "react";
import "./index.css";
import { BalanceState, Transaction } from "../../component/balanceState";
import Back from "../../component/back-button";
import Divider from "../../component/divider";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../App";

const TransactionPage: React.FC = () => {
  //==========================================

  const { transactionId } = useParams<{ transactionId?: string }>();
  const [transactionData, setTransactionData] = useState<Transaction | null>(
    null
  );
  const authContext = useContext(AuthContext);
  const userId = authContext.state.token;

  useEffect(() => {
    const getTransaction = async () => {
      try {
        if (authContext.state && userId && transactionId) {
          const res = await fetch(
            `http://localhost:4000/transaction/${transactionId}`,
            {
              headers: {
                Authorization: `Bearer ${userId}`,
              },
            }
          );

          const data = await res.json();

          if (res.ok) {
            setTransactionData(data.transactionData || null);
          } else {
            console.error(
              `Failed to fetch transaction data. Status: ${res.status}`
            );
            console.error("Error details:", data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (transactionId !== undefined) {
      getTransaction();
    }
  }, [userId, authContext.state, transactionId]);

  if (!transactionData) {
    console.log("No balanceState");
    return <p className="title-dark">Loading ...</p>;
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
            transactionData.type === "Sending"
              ? "sending-text"
              : "receiving-text"
          }`}>
          {transactionData.type === "Sending" ? "-" : "+"}$
          {transactionData.amount.split(".")[0]}
          <span className="transaction__amount-thin">
            {transactionData.amount.split(".")[1] && "."}
            {transactionData.amount.split(".")[1]}
          </span>
        </p>

        <div className="transaction__context">
          <div className="transaction__card">
            <p>Date</p>
            <span>{transactionData.paymentDate}</span>
          </div>
          <Divider className="divider" style={{ margin: "16px 0" }} />
          <div className="transaction__card">
            <p>Address</p>
            <span>{transactionData.paymentMethod}</span>
          </div>
          <Divider className="divider" style={{ margin: "16px 0" }} />
          <div className="transaction__card">
            <p>Type</p>
            <span>{transactionData.type}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionPage;
