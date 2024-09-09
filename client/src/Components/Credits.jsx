import React from "react";
const { shell } = window.require("electron");

const Credits = ({ credits, setCredits, lang, language }) => {
  return (
    <div
      className="credits"
      style={
        credits
          ? { opacity: 1, pointerEvents: "unset" }
          : { opacity: 0, pointerEvents: "none" }
      }
      onClick={({ target }) => {
        if (target.tagName !== "BUTTON" && !target.closest(".buttons")) {
          setCredits(false);
        }
      }}
    >
      <div className="marquee marquee-decorator marquee-1">
        <div
          className="marquee-content"
          style={{ animation: "scroll 30s linear infinite" }}
        >
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
        </div>
        <div
          className="marquee-content"
          style={{ animation: "scroll 30s linear infinite" }}
        >
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
        </div>
      </div>
      <img
        src={"/assets/svg/Andrix.svg"}
        className="andrixBg"
        alt="Andrix Background"
      />
      <img
        src={"/assets/svg/Andrix.svg"}
        className="andrixLogo"
        alt="Andrix Design"
        style={
          credits
            ? { animation: "logo 1.25s ease", animationFillMode: "forwards" }
            : { transform: "scale(100%) translateX(-260px)" }
        }
      />
      <div
        className="creditsInfo"
        style={
          credits
            ? {
                opacity: 1,
                transition: "opacity 0.3s ease",
                transitionDelay: "1.25s",
              }
            : { opacity: 0, transition: "opacity 0.3s ease" }
        }
      >
        <h2>Andrix Design</h2>
        <p>{lang.home[language].credits}</p>
        <div className="buttons">
          <button
            onClick={() => {
              shell.openExternal("https://www.andrix.design");
            }}
          >
            {lang.home[language].button3}
          </button>
          <button
            onClick={() => {
              shell.openExternal("https://www.andrix.design");
            }}
          >
            {lang.home[language].button4}
          </button>
        </div>
      </div>
      <div className="marquee marquee-decorator marquee-2">
        <div
          className="marquee-content"
          style={{
            animation: "scroll 30s linear infinite",
            animationDirection: "reverse",
          }}
        >
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
        </div>
        <div
          className="marquee-content"
          style={{
            animation: "scroll 30s linear infinite",
            animationDirection: "reverse",
          }}
        >
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
          <span>Andrix Design • </span>
        </div>
      </div>
      <div className="blur"></div>
    </div>
  );
};

export default Credits;
