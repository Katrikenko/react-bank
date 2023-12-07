import React, { useState, useContext, useEffect } from "react";
import { AuthContext, Authentication } from "../../App";
import { useNavigate } from "react-router-dom";
import { User } from "../../App";
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
    const confirmationData = localStorage.getItem("confirmationData");
    if (
      confirmationData &&
      authContext.state.user &&
      authContext.state.user.email
    ) {
      const { email } = authContext.state.user;
      fetch(`http://localhost:4000/users?email=${email}`)
        .then((response) => response.json())
        .then((data) => {
          const currentUser = data.find((user: User) => user.email === email);
          if (currentUser && currentUser.confirm) {
            navigate("/balance");
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));
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

  const handleSubmit = async () => {
    const confirmationData = localStorage.getItem("confirmationData");

    if (
      confirmationData &&
      authContext.state.user &&
      authContext.state.user.email
    ) {
      const { email, password, confirmCode } = JSON.parse(confirmationData);
      try {
        const res = await fetch("http://localhost:4000/signup-confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, confirmCode }),
        });

        const data = await res.json();

        if (res.ok) {
          const { confirmCode } = data;

          localStorage.setItem(
            "confirmationData",
            JSON.stringify({ email, password, confirmCode })
          );

          authContext.dispatch({
            type: Authentication.CONFIRM_ACCOUNT,
            payload: {
              user: {
                ...authContext.state.user!,
                confirm: true,
                confirmCode,
              },
            },
          });

          alert("Account verification successful");
          navigate("/balance");
        } else {
          console.log("Data:", data);
          console.log("confirmCode:", confirmCode);
          setError(FIELD_ERROR.CODE);
        }
      } catch (err) {
        console.log(err);
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
          Confirm
        </button>
      </form>
    </div>
  );
};

export default SignupConfirmPage;
