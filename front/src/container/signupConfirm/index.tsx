import React, { useState, useContext, useEffect } from "react";
import { AuthContext, Authentication } from "../../App";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldCode from "../../component/field-code";

const FIELD_ERROR = {
  CODE: "The code is invalid. Please try again",
  NO_CODE: "The code does not exist.",
};

const SignupConfirmPage: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const getUsersConfirm = localStorage.getItem("users");
    const users = getUsersConfirm ? JSON.parse(getUsersConfirm) : null;

    if (users && authContext.state.user && authContext.state.user.email) {
      const currentUser = users.find(
        (user: any) => user.email === authContext.state.user!.email
      );
      if (currentUser && currentUser.confirm) {
        return navigate("/balance");
      }
    }
  }, [authContext, authContext.state.user, navigate]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const enteredCode = e.target.value;
    setCode(enteredCode);
    clearCode();
  };

  const clearCode = () => {
    setError("");
  };

  const handleSubmit = () => {
    const getUsersConfirm = localStorage.getItem("users");
    const users = getUsersConfirm ? JSON.parse(getUsersConfirm) : null;

    if (users && authContext.state.user && authContext.state.user.email) {
      const currentUser = users.find(
        (user: any) => user.email === authContext.state.user?.email
      );

      if (currentUser) {
        const userConfirmCode = currentUser.confirmCode;

        if (userConfirmCode !== null && code === userConfirmCode.toString()) {
          authContext.dispatch({
            type: Authentication.CONFIRM_ACCOUNT,
            payload: {
              user: {
                ...authContext.state.user!,
                confirm: true,
              },
            },
          });

          const confirmedUser = users.map((user: any) => {
            if (user.email === authContext.state.user?.email) {
              return {
                ...user,
                confirm: true,
              };
            }
            return user;
          });

          localStorage.setItem("users", JSON.stringify(confirmedUser));

          alert("Account verification successful");

          return navigate("/balance");
        } else {
          setError(FIELD_ERROR.CODE);
        }
      } else {
        setError(FIELD_ERROR.NO_CODE);
      }
    } else {
      setError(FIELD_ERROR.NO_CODE);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <Back />
      </header>

      <form className="page__section">
        <div>
          <h1 className="title-dark">Confirm account</h1>
          <p className="text-grey">Write the code you received</p>
        </div>
        <div className="form">
          <FieldCode value={code} onChange={handleChange} error={error} />
        </div>

        <button
          id="text-button"
          onClick={handleSubmit}
          type="button"
          className="button button-dark">
          Restore password
        </button>
      </form>
    </div>
  );
};

export default SignupConfirmPage;
