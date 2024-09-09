import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = ({
  handleLogin,
  handleKeyDown,
  setUsername,
  username,
  loading,
  lang,
  language,
}) => {
  return (
    <>
      <div className="loginForm">
        <p>
          {lang.home[language].login1}{" "}
          <strong>{lang.home[language].login2}</strong>{" "}
          {lang.home[language].login3}
          <br />
          {lang.home[language].login4}
        </p>
        <div className="input">
          <label htmlFor="username">
            <img src={"/assets/svg/user-input.svg"} alt="User" />
          </label>
          <input
            type="text"
            name="Username"
            id="username"
            placeholder={lang.home[language].placeholder}
            onChange={({ target }) => setUsername(target.value)}
            onKeyDown={handleKeyDown}
            value={username}
          />
        </div>
        <div className="buttons">
          {loading ? (
            <button disabled>{lang.home[language].loading}</button>
          ) : (
            <button onClick={handleLogin}>{lang.home[language].button1}</button>
          )}

          <Link to="/emulators">
            <button>{lang.home[language].button2}</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
