import React, { useEffect, useState, useContext } from "react";
import { useSaveNotification } from "../../component/notifications";
import { AuthContext, Authentication } from "../../App";
import "./index.css";
import "../../global.css";

import { BalanceState, Notification } from "../../component/balanceState";
import Back from "../../component/back-button";

const ReceivePage: React.FC = () => {
  const [amount, setAmount] = useState("0.00");
  const [error, setError] = useState("");

  const saveNotification = useSaveNotification();

  const [balanceState, setBalanceState] = useState<BalanceState>({
    balance: "0.00",
    notifications: [],
  });

  const authContext = useContext(AuthContext);
  const userId = authContext.state.token;

  useEffect(() => {
    const savedBalanceState = localStorage.getItem(`balanceState_${userId}`);
    if (savedBalanceState) {
      const parsedBS = JSON.parse(savedBalanceState);
      setBalanceState(parsedBS);
    }
  }, []);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const receivedAmount = e.target.value;
    setAmount(receivedAmount);
    clearCode();
  };

  const clearCode = () => {
    setError("");
  };

  const handleBalanceUpdate = (updatedBalanceValue: string) => {
    authContext.dispatch({
      type: Authentication.UPDATE_BALANCE,
      payload: {
        balance: updatedBalanceValue,
      },
    });
  };

  const handleSubmit = (method: string) => {
    if (!method) {
      setError("Please select a payment method");
      return;
    }

    if (!balanceState || !balanceState.notifications) {
      console.error("balanceState or balanceState.notifications is undefined");
      return;
    }

    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      const getBalance = parseFloat(balanceState.balance);

      const totalBalance = getBalance + numAmount;

      const totalBalanceString = totalBalance.toFixed(2);

      handleBalanceUpdate(totalBalanceString);

      const currentDate = new Date();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const currentTime = `${hours}:${minutes}`;

      const receiptData: Notification = {
        amount: numAmount.toFixed(2).toString(),
        paymentMethod: method,
        paymentTime: currentTime,
        paymentDate: currentDate.toDateString(),
        type: "Receipt",
      };

      const updatedBalanceState: BalanceState = {
        balance: totalBalanceString,
        notifications: [...balanceState.notifications, receiptData],
      };

      setBalanceState(updatedBalanceState);
      localStorage.setItem(
        `balanceState_${userId}`,
        JSON.stringify(updatedBalanceState)
      );

      const getUser = localStorage.getItem("user");
      const user = getUser ? JSON.parse(getUser) : null;
      const token = user ? user.token : null;

      saveNotification("Announcement", "Incoming transaction", token);

      clearCode();
      setAmount("0.00");
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
