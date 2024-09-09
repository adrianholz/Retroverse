import React, { useState, useContext, useEffect } from "react";
import Login from "./User/Login";
import { motion } from "framer-motion";
import UserProfile from "./User/UserProfile";
import UserContext from "../UserContext";
import lang from "../Data/languages.json";
import "./Home.css";
import Credits from "./Credits";

const Home = () => {
  const {
    language,
    login,
    userLogin,
    loading,
    fetchRecentGames,
    fetchAwards,
    fetchRecentAchievements,
  } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [credits, setCredits] = useState(false);

  async function handleLogin() {
    await userLogin(username);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleLogin();
    }
  }

  async function fetchUserData(username) {
    await fetchAwards(username);
    await fetchRecentGames(username);
    await fetchRecentAchievements(username);
  }

  useEffect(() => {
    const username = window.localStorage.getItem("username");
    if (login && username) {
      fetchUserData(username);
    }
  }, []);

  return (
    <>
      <Credits
        credits={credits}
        setCredits={setCredits}
        lang={lang}
        language={language}
      />

      <div className="container">
        {login ? (
          <motion.div
            key="login"
            initial={login ? { opacity: 0, x: -50 } : { opacity: 0, y: 50 }}
            animate={login ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserProfile />
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={login ? { opacity: 0, x: -50 } : { opacity: 0, y: 50 }}
            animate={login ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="welcome">
              <span>{lang.home[language].welcome}</span>
              <h1>{lang.home[language].title}</h1>
              <p>
                {lang.home[language].madeBy}{" "}
                <strong
                  onClick={() => {
                    setCredits(true);
                  }}
                >
                  Andrix Design
                </strong>
              </p>
            </div>
            <Login
              handleLogin={handleLogin}
              handleKeyDown={handleKeyDown}
              setUsername={setUsername}
              username={username}
              loading={loading}
              lang={lang}
              language={language}
            />
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Home;
