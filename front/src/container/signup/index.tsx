import React, { useState, useContext } from "react";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldEmail from "../../component/field-email";
import FieldPassword from "../../component/field-password";
import { AuthContext, Authentication } from "../../App";
import { useNavigate } from "react-router-dom";

export const REG_EXP_EMAIL = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);
export const REG_EXP_PASSWORD = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
);

const FIELD_NAME = {
  EMAIL: "email",
  PASSWORD: "password",
};

const FIELD_ERROR = {
  IS_EMPTY: "Please fill in all required fields",
  IS_BIG: "This value is too long",
  USER_EXIST: "A user with the same name is already exist",
  EMAIL: "Please enter a valid email address",
  PASSWORD:
    "Password should contain at least one digit, one lowercase letter, one uppercase letter, and be 8 characters long",
};

const SignupPage: React.FC = () => {
  //==============================================

  const [alertVisible, setAlertVisible] = useState(false);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleAlert = (isVisible: boolean) => {
    setAlertVisible(isVisible);
  };

  const calculateIsFormValid = (errors: any) => {
    return Object.values(errors).every((error) => error === "");
  };

  const [isFormValid, setIsFormValid] = useState(false);

  const [formData, setFormData] = useState({
    [FIELD_NAME.EMAIL]: "",
    [FIELD_NAME.PASSWORD]: "",
  });

  const [error, setError] = useState({
    [FIELD_NAME.EMAIL]: "",
    [FIELD_NAME.PASSWORD]: "",
  });

  const clearForm = () => {
    setFormData({
      [FIELD_NAME.EMAIL]: "",
      [FIELD_NAME.PASSWORD]: "",
    });
    setError({
      [FIELD_NAME.EMAIL]: "",
      [FIELD_NAME.PASSWORD]: "",
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
    if (name === FIELD_NAME.PASSWORD) {
      if (!REG_EXP_PASSWORD.test(String(value))) {
        return FIELD_ERROR.PASSWORD;
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

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isFormValid = calculateIsFormValid(error);

    if (isFormValid) {
      try {
        const { email, password } = formData;

        const res = await fetch("http://localhost:4000/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          const { user } = data;

          const token = user.token;

          const confirmCode = user.confirmCode;

          authContext.dispatch({
            type: Authentication.LOGIN,
            payload: {
              token: token,
              user: {
                ...user,
                confirm: false,
                email: email,
                password: password,
                token: token,
                confirmCode: confirmCode,
              },
            },
          });

          const confirmData = {
            email,
            password,
            confirmCode,
          };

          console.log("confirmData before", confirmData);

          const confirmDataString = JSON.stringify(confirmData);
          localStorage.setItem("confirmationData", confirmDataString);
          console.log("confirmData after", confirmDataString);

          localStorage.setItem("token", JSON.stringify(token));
          clearForm();
          navigate("/signup-confirm");
        } else {
          toggleAlert(true);
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
          <h1 className="title-dark">Sign up</h1>
          <p className="text-grey">Choose a registration method</p>
        </div>
        <div className="form">
          <FieldEmail
            value={formData[FIELD_NAME.EMAIL]}
            onChange={handleChange}
            error={error[FIELD_NAME.EMAIL]}
          />

          <FieldPassword
            label={"Password"}
            value={formData[FIELD_NAME.PASSWORD]}
            onChange={handleChange}
            error={error[FIELD_NAME.PASSWORD]}
            showPassword={showPassword}
            onTogglePassword={togglePasswordVisibility}
            placeholder="Pass2000ID"
          />
        </div>

        <div className="recovery">
          <p className="text">
            Already have an account?{" "}
            <a href="/signin" className="link">
              Sign In
            </a>
          </p>
        </div>
        <button
          onClick={handleSubmit}
          type="submit"
          className="button button-dark"
          disabled={!isFormValid}>
          Continue
        </button>
        <span className={`alert ${alertVisible ? "" : "hide-alert"}`}>
          <img alt="Alert sign" src="./svg//alert.svg" />
          {[FIELD_ERROR.USER_EXIST]}
        </span>
      </form>
    </div>
  );
};

export default SignupPage;
