import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, Authentication, User } from "../../App";
import { useSaveNotification } from "../../component/notifications";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldEmail from "../../component/field-email";
import FieldPassword from "../../component/field-password";

export const REG_EXP_PASSWORD = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
);
export const REG_EXP_EMAIL = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);

const FIELD_ERROR = {
  EMAIL: "Please enter a valid email address",
  NEW_PASSWORD:
    "Password should contain at least one digit, one lowercase letter, one uppercase letter, and be 8 characters long",
};

const SettingsPage: React.FC = () => {
  const saveNotification = useSaveNotification();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { dispatch } = useContext(AuthContext);
  const authContext = useContext(AuthContext);

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    setEmail(value);

    if (REG_EXP_EMAIL.test(value)) {
      setError({ ...error, email: "" });
    } else {
      setError({ ...error, email: FIELD_ERROR.EMAIL });
    }
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const { value } = e.target;
    setNewPassword(value);

    if (REG_EXP_PASSWORD.test(value)) {
      setError({ ...error, password: "" });
    } else {
      setError({ ...error, password: FIELD_ERROR.NEW_PASSWORD });
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });

    setError({
      ...error,
      [name]: "",
    });
  };

  const isFormValid = !email && !user.password && !newPassword;

  const handleSavePassword = () => {
    const getPassword = localStorage.getItem("users");
    if (getPassword) {
      const userPassword = getPassword ? JSON.parse(getPassword) : null;

      if (userPassword) {
        const currentUser = userPassword.find(
          (user: User) =>
            authContext.state.user &&
            user.password === authContext.state.user.password
        );

        if (currentUser) {
          currentUser.password = newPassword;
          const token = currentUser.token;

          if (token) {
            saveNotification("Warning", "Password Changed", token);
            localStorage.setItem("users", JSON.stringify(userPassword));
          }
        }
      }
    }
  };

  const handleSaveEmail = () => {
    const getEmail = localStorage.getItem("users");
    if (getEmail) {
      const userEmail = getEmail ? JSON.parse(getEmail) : null;

      if (userEmail) {
        const currentUser = userEmail.find(
          (user: User) =>
            authContext.state.user &&
            user.email === authContext.state.user.email
        );

        if (currentUser) {
          currentUser.email = email;
          const token = currentUser.token;
          saveNotification("Warning", "Email Changed", token);

          localStorage.setItem("users", JSON.stringify(userEmail));
        }
      }
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({
      type: Authentication.LOGOUT,
      payload: {},
    });

    navigate("/");
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="page">
      <header className="header header-center">
        <Back />
        <h1 className="title-dark">Settings</h1>
      </header>

      <form className="page__section">
        <div className="email__section">
          <div className="form">
            <h2 className="title-small">Change Email</h2>
            <FieldEmail
              value={email}
              onChange={handleEmailChange}
              error={error.email}
            />

            <FieldPassword
              label={"Old password"}
              value={user.password}
              onChange={handleChange}
              error={error.password}
              showPassword={showPassword}
              onTogglePassword={togglePasswordVisibility}
              placeholder="********"
            />
          </div>

          <button
            onClick={handleSaveEmail}
            type="button"
            className="button light-button"
            disabled={isFormValid}>
            Save Email
          </button>
        </div>

        <hr className="divider" />

        <div className="password__section">
          <div className="form">
            <h2 className="title-small">Change Password</h2>
            <FieldPassword
              label={"Old password"}
              value={user.password}
              onChange={handleChange}
              error={error.password}
              showPassword={showPassword}
              onTogglePassword={togglePasswordVisibility}
              placeholder="********"
            />

            <FieldPassword
              label={"New password"}
              value={newPassword}
              onChange={handlePasswordChange}
              error={error.password}
              showPassword={showPassword}
              onTogglePassword={togglePasswordVisibility}
              placeholder="********"
            />
          </div>

          <button
            onClick={handleSavePassword}
            type="button"
            className="button light-button"
            id="no-padding"
            disabled={isFormValid}>
            Save Password
          </button>
        </div>
        <hr className="divider" />

        <button
          onClick={handleLogout}
          type="submit"
          className="button logout-button">
          Log out
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
