import React, { useState, useEffect, useContext } from "react";
const { ipcRenderer } = require("electron");
import BarLoader from "react-spinners/BarLoader";
import lang from "../Data/languages.json";
import "./Loading.css";
import "./Stars.scss";
import UserContext from "../UserContext";

const Loading = () => {
  const { language } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    ipcRenderer.on("loading", (event, isLoading) => {
      setLoading(isLoading);
    });

    ipcRenderer.on("text", (event, textContent) => {
      setText(textContent);
    });

    return () => {
      ipcRenderer.removeAllListeners("loading");
      ipcRenderer.removeAllListeners("text");
    };
  }, []);

  return (
    <>
      <div
        className="loadingApp"
        style={
          loading
            ? { opacity: 1, pointerEvents: "unset" }
            : { opacity: 0, pointerEvents: "none" }
        }
      >
        <div className="loadingAppInner">
          <h1>{lang.loading[language].title}</h1>
          <BarLoader
            color="#ffffff"
            loading={true}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
            className="audioLoading"
          />
          <img
            src={"/assets/png/misc/orbit-shadow.png"}
            alt="Orbit Shadow"
            className="orbitShadow"
          />
          <img
            src={"/assets/png/misc/orbit.png"}
            alt="Orbit"
            className="orbit"
          />
          <img
            className="orbitImage"
            src={"/assets/png/misc/atari.png"}
            alt="Atari"
            style={{ "--d": "5s", "--o": "145px" }}
          />
          <img
            className="orbitImage"
            src={"/assets/png/misc/n64.png"}
            alt="Nintendo 64"
            style={{
              "--d": "7.5s",
              "--o": "205px",
              animationDirection: "reverse",
            }}
          />
          <img
            className="orbitImage"
            src={"/assets/png/misc/ps.png"}
            alt="PlayStation"
            style={{ "--d": "15s", "--o": "267px" }}
          />
        </div>
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
        <p className="loadingText">{text}</p>
      </div>
    </>
  );
};

export default Loading;
