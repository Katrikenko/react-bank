import React, { useEffect, useState, useContext } from "react";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";
import { BalanceState, Notification } from "../../component/balanceState";
import { useSaveNotification } from "../../component/notifications";
import { AuthContext, Authentication, User } from "../../App";
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

  const userId = authContext.state.token;

  const [balanceState, setBalanceState] = useState<BalanceState>({
    balance: "0.00",
    notifications: [],
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

  const handleBalanceUpdate = (updatedBalanceValue: string) => {
    authContext.dispatch({
      type: Authentication.UPDATE_BALANCE,
      payload: {
        balance: updatedBalanceValue,
      },
    });
  };

  const handleSubmit = () => {
    if (!REG_EXP_EMAIL.test(recipient.email)) {
      setError({
        ...error,
        email: "Invalid email",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      if (balanceState !== null) {
        const getBalance = parseFloat(balanceState.balance);

        const totalBalance = getBalance - numAmount;

        const totalBalanceString = totalBalance.toFixed(2);

        handleBalanceUpdate(totalBalanceString);

        const currentDate = new Date();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const currentTime = `${hours}:${minutes}`;

        const sendingData: Notification = {
          amount: numAmount.toFixed(2).toString(),
          paymentMethod: recipient.email,
          paymentTime: currentTime,
          paymentDate: currentDate.toDateString(),
          type: "Sending",
        };

        const updatedBalanceState: BalanceState = {
          balance: totalBalanceString,
          notifications: [...balanceState.notifications, sendingData],
        };

        setBalanceState(updatedBalanceState);

        setRecipient({ email: "" });

        localStorage.setItem(
          `balanceState_${userId}`,
          JSON.stringify(updatedBalanceState)
        );

        const getUsers = localStorage.getItem("users");
        const users = getUsers ? JSON.parse(getUsers) : null;

        if (users) {
          const currentUser = users.find(
            (user: User) =>
              authContext.state.user &&
              user.email === authContext.state.user.email &&
              user.password === authContext.state.user.password
          );

          if (currentUser) {
            const token = currentUser.token;
            saveNotification("Announcement", "Outgoing transfer", token);
            clearCode();
            setAmount("0.00");
          }
        }
      }
    } else setError({ ...error, amount: "Please enter a valid amount" });
    return;
  };

  useEffect(() => {
    setIsFormValid(recipient.email.length > 0 && parseFloat(amount) > 0);

    const getBalanceState = localStorage.getItem(`balanceState_${userId}`);
    if (getBalanceState) {
      setBalanceState(JSON.parse(getBalanceState));
    }
  }, [recipient.email, amount, userId]);

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
          className="button button-dark"
          disabled={!isFormValid}>
          Send
        </button>
      </form>
    </div>
  );
};

export default SendPage;
