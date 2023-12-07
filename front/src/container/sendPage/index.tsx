import React, { useEffect, useState, useContext } from "react";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";
import { BalanceState, Transaction } from "../../component/balanceState";
import { useSaveNotification } from "../../component/notifications";
import { AuthContext, Authentication } from "../../App";
import FieldEmail from "../../component/field-email";

export const REG_EXP_EMAIL = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);

const SendPage: React.FC = () => {
  //==========================================
  const saveNotification = useSaveNotification();

  const [recipient, setRecipient] = useState({
    email: "",
  });
  const [amount, setAmount] = useState("0.00");
  const [error, setError] = useState({
    email: "",
    amount: "",
  });
  const authContext = useContext(AuthContext);
  const token = authContext.state.token;

  const [balanceState, setBalanceState] = useState<BalanceState>({
    balance: "0.00",
    transactions: [],
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const clearCode = () => {
    setError({ email: "", amount: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setRecipient({
        ...recipient,
        email: value,
      });
    } else if (name === "amount") {
      setAmount(value);
    }
    clearCode();
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

  const handleSubmit = async () => {
    if (!REG_EXP_EMAIL.test(recipient.email)) {
      setError({
        ...error,
        email: "Invalid email",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      if (authContext.state.user) {
        try {
          const res = await fetch("http://localhost:4000/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: token,
              recipientEmail: recipient.email,
              amount: numAmount,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const { balance, notifications } = data;

            handleBalanceUpdate(balance);

            saveNotification("Announcement", "Outgoing transfer", token!);
            setRecipient({ email: "" });
            setAmount("0.00");

            setIsFormValid(false);
          } else {
            console.error("Failed to send amount");
          }
        } catch (err) {
          console.error(err);
        }
      }
    } else setError({ ...error, amount: "Please enter a valid amount" });
    return;
  };

  useEffect(() => {
    setIsFormValid(recipient.email.length > 0 && parseFloat(amount) > 0);
  }, [recipient.email, amount]);

  return (
    <div className="page darker-page">
      <header className="header">
        <Back />
      </header>

      <form className="page__section">
        <div>
          <h1 className="title-dark">Send</h1>
        </div>
        <div className="form">
          <FieldEmail
            value={recipient.email}
            onChange={handleChange}
            error={error.email}
          />

          <div className="form__item">
            <label className="field__label">Sum</label>
            <input
              className={`field__input ${error.email ? "error" : ""}`}
              type="number"
              inputMode="decimal"
              name="amount"
              value={amount}
              onChange={handleChange}
              placeholder="$0.00"
              step="0.01"
            />
            <span className="form__error" id="amountError">
              {error.amount}
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          type="button"
          className="button button-dark">
          Send
        </button>
      </form>
    </div>
  );
};

export default SendPage;
