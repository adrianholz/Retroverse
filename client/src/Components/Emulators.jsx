import React, { useContext, useEffect } from "react";
import "./Emulators.css";
import Emulator from "./Emulator";
import setupCarousel from "../Helper/emulatorCarousel.js";
import { motion } from "framer-motion";
import UserContext from "../UserContext.jsx";
import { useNavigate } from "react-router-dom";
import lang from "../Data/languages.json";

const Home = () => {
  const navigate = useNavigate();
  const {
    settings,
    isCarouselEnabled,
    setIsCarouselEnabled,
    emulatorData,
    language,
  } = useContext(UserContext);

  const activeEmulators = window.localStorage.getItem("activeEmulators")
    ? window.localStorage.getItem("activeEmulators").split(", ")
    : ["snes"];

  useEffect(() => {
    setupCarousel(isCarouselEnabled, activeEmulators.length);
  }, [isCarouselEnabled, activeEmulators.length]);

  useEffect(() => {
    setIsCarouselEnabled(!settings);
  }, [settings]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === "Escape") {
      navigate("/");
    }
  };

  const handleEmulatorClick = (emulatorName) => {
    navigate(`/emulators/${emulatorName}`);
  };

  return (
    <div className="trackContainer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() =>
          setupCarousel(isCarouselEnabled, activeEmulators.length)
        }
      >
        <div className="trackBefore">
          <div className="marquee marquee-decorator marquee-2">
            <div
              className="marquee-content"
              style={{ animation: "scroll 30s linear infinite" }}
            >
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
            </div>
            <div
              className="marquee-content"
              style={{ animation: "scroll 30s linear infinite" }}
            >
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
            </div>
          </div>
        </div>
        <div className="track" data-mouse-down-at="0" data-prev-percentage="0">
          {activeEmulators.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: -2000, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={
                activeEmulators.length >= 15
                  ? { duration: 0.75, delay: 0 }
                  : { duration: 0.75, delay: 0.175 * index }
              }
              style={{ zIndex: `${0 - index}` }}
            >
              {emulatorData[item] && (
                <Emulator
                  name={emulatorData[item].name}
                  onClick={() => handleEmulatorClick(item)}
                  onfocus={(event) => {
                    event.currentTarget.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <div className="trackAfter">
          <div className="marquee marquee-decorator marquee-1">
            <div
              className="marquee-content"
              style={{
                animation: "scroll 30s linear infinite",
                animationDirection: "reverse",
              }}
            >
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
            </div>
            <div
              className="marquee-content"
              style={{
                animation: "scroll 30s linear infinite",
                animationDirection: "reverse",
              }}
            >
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
              <span>{lang.emulators[language].title} • </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
