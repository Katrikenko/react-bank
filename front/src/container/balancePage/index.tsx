import React, { useEffect, useState, useContext } from "react";
import { AuthContext, Authentication } from "../../App";
import { Link } from "react-router-dom";
import "./index.css";
import { BalanceState, Transaction } from "../../component/balanceState";

const BalancePage: React.FC = () => {
  //==========================================

  const [balanceState, setBalanceState] = useState<BalanceState | null>(null);
  const [transactionData, setTransactionData] = useState<Transaction | null>(
    null
  );
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);
  const authContext = useContext(AuthContext);
  const { token } = authContext.state;

  useEffect(() => {
    const getBalanceState = async () => {
      try {
        if (authContext.state && token) {
          const res = await fetch(`http://localhost:4000/balance/${token}`);
          const data = await res.json();

          if (res.ok) {
            authContext.dispatch({
              type: Authentication.UPDATE_BALANCE,
              payload: {
                balance: data.balance,
                notifications: data.notifications || [],
              },
            });
            setBalanceState({
              balance: data.balance,
              transactions: data.transactions || [],
            });
            setTransactionData(data.transactionData || null);
            setReceiptData(data.receiptData || null);
          } else {
            console.error(`Did not get balance. Status: ${res.status}`);
            try {
              console.error("Error details:", data);
            } catch (error) {
              console.error("Failed to parse error response:", error);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (!balanceState) {
      getBalanceState();
    }
  }, [token, authContext.state]);

  return (
    <div className="page">
      <div className="bg-image">
        <header className="header">
          <Link to="/settings">
            <img
              src="./svg/settings-button.svg"
              alt="settings"
              height={"24px"}
              width={"24px"}
            />
          </Link>
          <span className="small-title">Main wallet</span>
          <Link to="/notifications">
            <img
              src="./svg/notification-button.svg"
              alt="notification"
              height={"24px"}
              width={"24px"}
            />
          </Link>
        </header>
        <p className="balance">
          $ {balanceState?.balance.split(".")[0] || "0"}
          <span className="balance-thin">
            .{balanceState?.balance.split(".")[1] || "00"}
          </span>
        </p>
      </div>
      <section className="center-section">
        <Link className="balance-btn" to="/receive">
          <img
            src="./svg/receive-btn.svg"
            alt="receive"
            height={"72px"}
            width={"72px"}
          />
          <span className="text">Receive</span>
        </Link>
        <Link className="balance-btn" to="/send">
          <img
            src="./svg/send-btn.svg"
            alt="send"
            height={"72px"}
            width={"72px"}
          />
          <span className="text">Send</span>
        </Link>
      </section>
      <main className="balance-section">
        {balanceState &&
          balanceState.transactions &&
          balanceState.transactions
            .slice()
            .reverse()
            .map((receipt: Transaction, index: number) => (
              <Link
                to={`/transaction/${index}`}
                className="card"
                key={index + Math.random().toString(16).slice(2)}
                style={{ textDecoration: "none", color: "inherit" }}>
                <img
                  src={
                    receipt.paymentMethod === "Coinbase"
                      ? "./svg/coinbase-profile.svg"
                      : receipt.paymentMethod === "Stripe"
                      ? "./svg/stripe-profile.svg"
                      : "./svg/user-profile.svg"
                  }
                  className="card-img"
                  alt="profile"
                />
                <div className="card-content">
                  <p className="card__title">{receipt.paymentMethod}</p>
                  <div className="card-subtitle">
                    <span>{receipt.paymentTime}</span>
                    <img src="./svg/dot.svg" alt="ellipse" />
                    <span>{receipt.type}</span>
                  </div>
                </div>
                <p
                  className={`card-text ${
                    receipt.type === "Sending"
                      ? "sending-text"
                      : "receiving-text"
                  }`}>
                  {receipt.type === "Sending" ? "-" : "+"}$
                  {receipt.amount.split(".")[0]}
                  <span className="receipt__amount-thin">
                    {receipt.amount.split(".")[1] && "."}
                    {receipt.amount.split(".")[1]}
                  </span>
                </p>
              </Link>
            ))}
      </main>
    </div>
  );
};

export default BalancePage;
