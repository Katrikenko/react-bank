import React, { useState, useContext, useEffect } from "react";
import { User, AuthContext } from "../../App";
import { useSaveNotification } from "../../component/notifications";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldCode from "../../component/field-code";
import FieldPassword from "../../component/field-password";

export const REG_EXP_PASSWORD = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
);

const FIELD_ERROR = {
  CODE: "Invalid code. Try again",
  NEW_PASSWORD:
    "Password should contain at least one digit, one lowercase letter, one uppercase letter, and be 8 characters long",
};

const RecoveryConfirmPage: React.FC = () => {
  const navigate = useNavigate();

  const authContext = useContext(AuthContext);
  const token = authContext.state.token || "";

  const saveNotification = useSaveNotification();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const recoveryCode = sessionStorage.getItem("recoveryCode");
  const recoveryEmail = sessionStorage.getItem("recoveryEmail");

  const handleCodeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const enteredCode = e.target.value;
    setCode(enteredCode);
    setCodeError("");
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const { value } = e.target;
    setNewPassword(value);

    if (!recoveryCode || !recoveryEmail) {
      console.error("Recovery code or email not found");
      return;
    }

    if (recoveryCode === code) {
      if (REG_EXP_PASSWORD.test(value)) {
        setPasswordError("");
      } else {
        setPasswordError(FIELD_ERROR.NEW_PASSWORD);
      }
    } else {
      setCodeError(FIELD_ERROR.CODE);
    }
  };

  const isFormValid = !codeError && !passwordError;

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isFormValid) {
      try {
        const res = await fetch("http://localhost:4000/recovery-confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: recoveryEmail,
            recoveryCode: code,
            newPassword: newPassword,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          saveNotification("Warning", "Password Recovery", token);
          alert("Password was updated");
          navigate("/balance");
        } else {
          setCodeError(FIELD_ERROR.CODE);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="page">
      <header className="header">
        <Back />
      </header>

      <form className="page__section">
        <div>
          <h1 className="title-dark">Recover password</h1>
          <p className="text-grey">Write the code you received</p>
        </div>
        <div className="form">
          <FieldCode
            value={code}
            onChange={handleCodeChange}
            error={codeError}
          />

          <FieldPassword
            label={"New password"}
            value={newPassword}
            onChange={handlePasswordChange}
            error={passwordError}
            showPassword={showPassword}
            onTogglePassword={togglePasswordVisibility}
            placeholder="********"
          />
        </div>

        <button
          id="text-button"
          onClick={handleSubmit}
          type="submit"
          className="button button-dark"
          disabled={!isFormValid}>
          Restore password
        </button>
      </form>
    </div>
  );
};

export default RecoveryConfirmPage;
