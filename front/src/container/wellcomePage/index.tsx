import React from "react";
import "./index.css";
import "../../global.css";
import { Link } from "react-router-dom";

const WelcomePage: React.FC = () => {
  return (
    <div className="page">
      <div className="background-image">
        <h1 className="title">Hello!</h1>
        <p className="undertext">Welcome to bank app</p>
        <img className="overlay-image" src="/img/safe.png" alt="safe" />
      </div>
      <div className="button__section">
        <Link to={"/signup"}>
          <button className="button button-dark">Sign up</button>
        </Link>
        <Link to={"/signin"}>
          <button className="button button-light">Sign in</button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
