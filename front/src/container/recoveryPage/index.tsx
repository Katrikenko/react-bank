import React, { useState, useContext } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldEmail from "../../component/field-email";

export const REG_EXP_EMAIL = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);

const FIELD_NAME = {
  EMAIL: "email",
};

const FIELD_ERROR = {
  IS_EMPTY: "Please fill in all required fields",
  IS_BIG: "This value is too long",
  EMAIL: "Please enter a valid email address",
};

const RecoveryPage: React.FC = () => {
  //==============================================
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const userId = authContext.state.token;

  const calculateIsFormValid = (errors: any) => {
    return Object.values(errors).every((error) => error === "");
  };

  const [isFormValid, setIsFormValid] = useState(false);

  const [formData, setFormData] = useState({
    [FIELD_NAME.EMAIL]: userId || "",
  });

  const [error, setError] = useState({
    [FIELD_NAME.EMAIL]: "",
  });

  const clearForm = () => {
    setFormData({
      [FIELD_NAME.EMAIL]: "",
    });
    setError({
      [FIELD_NAME.EMAIL]: "",
    });
  };

  const validate = (name: string, value: any) => {
    if (String(value).length < 1) {
      return FIELD_ERROR.IS_EMPTY;
    }
    if (String(value).length > 20) {
      return FIELD_ERROR.IS_BIG;
    }
    if (name === FIELD_NAME.EMAIL) {
      if (!REG_EXP_EMAIL.test(String(value))) {
        return FIELD_ERROR.EMAIL;
      }
    }
    return "";
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const errorMess = validate(name, value);
    setError({ ...error, [name]: errorMess });
    //=============================================

    const newIsFormValid = calculateIsFormValid({
      ...error,
      [name]: errorMess,
    });
    setIsFormValid(newIsFormValid);
  };

  const handleGetCode = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isFormValid = calculateIsFormValid(error);

    if (isFormValid) {
      try {
        const res = await fetch("http://localhost:4000/recovery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData[FIELD_NAME.EMAIL] }),
        });

        const data = await res.json();

        if (res.ok) {
          console.log(data.message);
          const recoveryCode = data.recoveryCode;
          sessionStorage.setItem("recoveryCode", recoveryCode);
          sessionStorage.setItem("recoveryEmail", formData[FIELD_NAME.EMAIL]);
          clearForm();
          navigate("/recovery-confirm");
        } else {
          console.log(data.message);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="page">
      <header className="header">
        <Back />
      </header>

      <form className="page__section">
        <div>
          <h1 className="title-dark">Recover password</h1>
          <p className="text-grey">Choose a recovery method</p>
        </div>
        <div className="form">
          <FieldEmail
            value={formData[FIELD_NAME.EMAIL]}
            onChange={handleChange}
            error={error[FIELD_NAME.EMAIL]}
          />
        </div>

        <button
          id="text-button"
          onClick={handleGetCode}
          type="submit"
          className="button button-dark"
          disabled={!isFormValid}>
          Send code
        </button>
      </form>
    </div>
  );
};

export default RecoveryPage;
