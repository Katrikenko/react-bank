import React, { useState, useContext } from "react";
import { AuthContext } from "../../App";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldEmail from "../../component/field-email";

export const REG_EXP_EMAIL = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);

const generateCode = () => {
  return Math.floor(Math.random() * 9000) + 1000;
};

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

  const handleGetCode = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isFormValid = calculateIsFormValid(error);

    if (isFormValid) {
      try {
        const getCode = generateCode();
        clearForm();

        const recoveryUserId = formData[FIELD_NAME.EMAIL];
        sessionStorage.setItem(`recoveryUserId`, recoveryUserId);
        sessionStorage.setItem(
          `recoveryCode_${recoveryUserId}`,
          getCode.toString()
        );
        localStorage.setItem("formData", JSON.stringify(formData));

        window.location.href = "/recovery-confirm";
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
