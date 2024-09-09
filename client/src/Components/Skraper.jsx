import React, { useContext } from "react";
import BarLoader from "react-spinners/BarLoader";
import UserContext from "../UserContext";
import lang from "../Data/languages.json";
import "./Skraper.css";

const Skraper = () => {
  const { skraper, language } = useContext(UserContext);

  return (
    <div
      className="skraper"
      style={
        skraper
          ? { opacity: 1, pointerEvents: "unset" }
          : { opacity: 0, pointerEvents: "none" }
      }
    >
      <div className="skraperContainer">
        <img src={"/assets/png/misc/skraper.png"} alt="Skraper Logo" />
        <p>
          <strong>{lang.skraper[language].skraper}</strong>{" "}
          {lang.skraper[language].running}
        </p>
        <BarLoader
          color="#ffffff"
          loading={true}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
          className="audioLoading"
        />
      </div>
    </div>
  );
};

export default Skraper;
