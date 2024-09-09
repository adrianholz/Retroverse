import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../UserContext";

const Emulator = ({ name, onClick }) => {
  const audioRef = useRef(null);
  const { settings, emulatorData } = useContext(UserContext);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);

  const style = emulatorData[name]?.styles || {
    logo: {
      maxWidth: "190px",
      left: "60px",
    },
  };

  function preventDragHandler(e) {
    e.preventDefault();
  }

  useEffect(() => {
    if (audioRef.current) {
      const volume = window.localStorage.getItem("sfxvol");
      audioRef.current.volume = volume ? Number(volume) : 0.5;
    }
  }, [settings]);

  useEffect(() => {
    if (style.video && style.video.keyframes) {
      const keyframes = style.video.keyframes;
      const keyframesString = Object.entries(keyframes)
        .map(([percent, props]) => {
          const propsString = Object.entries(props)
            .map(([key, value]) => `${key}: ${value};`)
            .join(" ");
          return `${percent} { ${propsString} }`;
        })
        .join(" ");

      const styleElement = document.createElement("style");
      document.head.appendChild(styleElement);
      const styleSheet = styleElement.sheet;

      const animationName = `customAnimation-${name}`;
      const keyframesRule = `@keyframes ${animationName} { ${keyframesString} }`;

      styleSheet.insertRule(keyframesRule, styleSheet.cssRules.length);
      style.video.animationName = animationName;
    }
  }, [style, name]);

  const handleMouseDown = () => {
    setIsDragging(false);
    setMouseDownTime(Date.now());
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    const clickDuration = Date.now() - mouseDownTime;
    if (!isDragging && clickDuration < 200) {
      onClick();
    }
    document.querySelector(`.${name}Sfx`).play();
  };

  return (
    <div
      className="emulator-container expand"
      onDragStart={preventDragHandler}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      id={name}
      tabIndex="0"
      onMouseEnter={() => {
        if (document.querySelector(`#${name}`).classList.contains("expand")) {
          document.querySelector(`.${name}Sfx`).play();
        }
      }}
    >
      <img
        src={`/assets/png/logo/${name}-logo.png`}
        alt={`${name} Logo Solid`}
        style={style.logo}
      />
      <div
        style={{ backgroundImage: `url("/assets/jpg/background/${name}.jpg")` }}
      >
        <div>
          <img
            src={`/assets/png/banner/${name}-banner.png`}
            alt={`${name} Banner`}
            onDragStart={preventDragHandler}
          />
        </div>
        <video
          src={`/assets/video/${name}.webm`}
          loop
          autoPlay
          muted
          style={{ ...style.video }}
        ></video>
        <audio
          ref={audioRef}
          className={`${name}Sfx`}
          src={`/assets/sfx/${name}.mp3`}
        ></audio>
      </div>
    </div>
  );
};

export default Emulator;
