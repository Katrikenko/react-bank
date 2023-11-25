import React, { useEffect, useState, useContext } from "react";
import { useSaveNotification } from "../../component/notifications";
import { AuthContext, Authentication, User } from "../../App";
import "./index.css";
import "../../global.css";
import Back from "../../component/back-button";

import FieldEmail from "../../component/field-email";
import FieldPassword from "../../component/field-password";
import { useNavigate } from "react-router-dom";

const SigninPage: React.FC = () => {
  //==========================================
  const saveNotification = useSaveNotification();

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const userId = authContext.state.token;

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = () => {
    if (authContext) {
      const savedData = localStorage.getItem("users");
      if (savedData) {
        const savedUsers = JSON.parse(savedData);

        const foundUser = savedUsers.find(
          (savedUser: User) =>
            authContext.state.user &&
            savedUser.email === user.email &&
            savedUser.password === user.password
        );

        if (foundUser) {
          const token = foundUser.token;

          authContext.dispatch({
            type: Authentication.LOGIN,
            payload: {
              token: token,
              user: {
                confirm: foundUser.confirm,
                email: foundUser.email,
                password: foundUser.password,
              },
            },
          });

          saveNotification(
            "Warning",
            "New Login",
            authContext.state.token || ""
          );
          alert("Login successful");
          navigate("/balance");
        } else {
          setError({
            password: "Incorrect password",
            email: "Incorrect email",
          });
        }
      } else {
        setError({ ...error, email: "User not found" });
      }
    }
  };

  useEffect(() => {
    setIsFormValid(user.email !== "" && user.password !== "");
  }, [user.email, user.password]);

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
          <h1 className="title-dark">Sign in</h1>
          <p className="text-grey">Select login method</p>
        </div>
        <div className="form">
          <FieldEmail
            value={user.email}
            onChange={handleChange}
            error={error.email}
          />

          <FieldPassword
            label={"Password"}
            value={user.password}
            onChange={handleChange}
            error={error.password}
            showPassword={showPassword}
            onTogglePassword={togglePasswordVisibility}
            placeholder="********"
          />
        </div>

        <div className="recovery">
          <p className="text">
            Forgot your password?{" "}
            <a href="/recovery" className="link">
              Restore
            </a>
          </p>
        </div>
        <button
          onClick={handleSubmit}
          type="button"
          className="button button-dark"
          disabled={!isFormValid}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default SigninPage;
