import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import { BalanceState, Notification } from "../../component/balanceState";
import { AuthContext } from "../../App";

const BalancePage: React.FC = () => {
  //==========================================

  const [balanceState, setBalanceState] = useState<BalanceState | null>(null);

  const authContext = useContext(AuthContext);
  const userId = authContext.state.token;

  useEffect(() => {
    const getBalanceState = localStorage.getItem(`balanceState_${userId}`);
    if (getBalanceState) {
      setBalanceState(JSON.parse(getBalanceState));
    }
  }, []);

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
          $ {balanceState ? balanceState.balance : "0.00"}
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
          balanceState.notifications &&
          balanceState.notifications
            .slice()
            .reverse()
            .map((receipt: Notification, index: number) => (
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
                  {receipt.type === "Sending" ? "-" : "+"}${receipt.amount}
                </p>
              </Link>
            ))}
      </main>
    </div>
  );
};

export default BalancePage;
