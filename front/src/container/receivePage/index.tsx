import React, { useEffect, useState, useContext } from "react";
import { useSaveNotification } from "../../component/notifications";
import { AuthContext, Authentication } from "../../App";
import "./index.css";
import "../../global.css";

import { BalanceState, Transaction } from "../../component/balanceState";
import Back from "../../component/back-button";

const ReceivePage: React.FC = () => {
  const [amount, setAmount] = useState("0.00");
  const [error, setError] = useState("");

  const saveNotification = useSaveNotification();

  const [balanceState, setBalanceState] = useState<BalanceState>({
    balance: "0.00",
    transactions: [],
  });
  const authContext = useContext(AuthContext);
  const token = authContext.state.token;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const receivedAmount = e.target.value;
    setAmount(receivedAmount);
    clearCode();
  };

  const clearCode = () => {
    setError("");
  };

  const handleBalanceUpdate = async (updatedBalanceValue: string) => {
    authContext.dispatch({
      type: Authentication.UPDATE_BALANCE,
      payload: {
        balance: updatedBalanceValue,
      },
    });
    try {
      const res = await fetch(`http://localhost:4000/balance/${token}`);
      if (res.ok) {
        const data = await res.json();
        setBalanceState({
          balance: data.balance,
          transactions: data.transactions,
        });
      } else {
        console.error("Failed to fetch updated balance from the server");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (method: string) => {
    if (!method) {
      setError("Please select a payment method");
      return;
    }

    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      const token = authContext.state.token;
      try {
        if (token) {
          const res = await fetch("http://localhost:4000/receive", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: token,
              amount: numAmount.toFixed(2),
              paymentMethod: method,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const { balance, transactions } = data;
            handleBalanceUpdate(balance);

            saveNotification("Announcement", "Incoming transaction", token);
            clearCode();
            setAmount("0.00");
          } else {
            console.error("Failed to update balance");
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="page darker-page">
      <header className="header">
        <Back />
      </header>

      <form className="page__section">
        <div>
          <h1 className="title-dark">Receive</h1>
        </div>
        <div className="form">
          <div className="form__item">
            <label className="field__label">Receive amount</label>
            <input
              className={`field__input ${error ? "error" : ""}`}
              type="number"
              inputMode="decimal"
              name="amount"
              value={amount}
              onChange={handleChange}
              placeholder="$0.00"
              step="0.01"
            />
            <span className="form__error" id="codeError">
              {error}
            </span>
          </div>
        </div>
        <div className="form_item">
          <label className="field__label">Payment system</label>
          <div
            className="payment__block"
            onClick={() => handleSubmit("Stripe")}>
            <img
              src="./svg/stripe-profile.svg"
              alt="logo"
              height={"40px"}
              width={"40px"}
            />
            <p className="card__title">Stripe</p>
            <div className="payment-methods">
              <img
                src="./svg/payment_methods/masterCard.svg"
                alt="master card"
              />
              <img src="./svg/payment_methods/2.svg" alt="payment method" />
              <img src="./svg/payment_methods/bitcoin.svg" alt="bitcoin" />
              <img src="./svg/payment_methods/tron.svg" alt="tron" />
              <img src="./svg/payment_methods/ethereum.svg" alt="ethereum" />
              <img src="./svg/payment_methods/binance.svg" alt="binance" />
            </div>
          </div>
          <div
            className="payment__block"
            onClick={() => handleSubmit("Coinbase")}>
            <img
              src="./svg/coinbase-profile.svg"
              alt="logo"
              height={"40px"}
              width={"40px"}
            />
            <p className="card__title">Coinbase</p>
            <div className="payment-methods">
              <img src="./svg/payment_methods/2.svg" alt="payment method" />
              <img
                src="./svg/payment_methods/masterCard.svg"
                alt="master card"
              />
              <img src="./svg/payment_methods/tron.svg" alt="tron" />
              <img src="./svg/payment_methods/bitcoin.svg" alt="bitcoin" />
              <img src="./svg/payment_methods/binance.svg" alt="binance" />
              <img src="./svg/payment_methods/ethereum.svg" alt="ethereum" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReceivePage;
