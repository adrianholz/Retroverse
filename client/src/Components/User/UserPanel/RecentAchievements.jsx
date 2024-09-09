import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import BarLoader from "react-spinners/BarLoader";

const RecentAchievements = ({ achievements, lang, language }) => {
  //Tooltip code to display data on hover of recent achievements.
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const [fade, setFade] = useState(false);
  const fadeOutTimeoutRef = useRef(null);
  const fadeInTimeoutRef = useRef(null);

  const handleMouseEnter = (event, achievement) => {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      content: achievement,
    });
    fadeInTimeoutRef.current = setTimeout(() => {
      setFade(true);
    }, 20);
    if (fadeOutTimeoutRef.current) {
      clearTimeout(fadeOutTimeoutRef.current);
    }
  };

  const handleMouseMove = (event) => {
    setTooltip((prevTooltip) => ({
      ...prevTooltip,
      x: event.clientX,
      y: event.clientY,
    }));
  };

  const handleMouseLeave = () => {
    setFade(false);
    fadeOutTimeoutRef.current = setTimeout(() => {
      setTooltip({
        visible: false,
        x: 0,
        y: 0,
        content: null,
      });
    }, 200);
    if (fadeInTimeoutRef.current) {
      clearTimeout(fadeInTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
      }
      if (fadeInTimeoutRef.current) {
        clearTimeout(fadeInTimeoutRef.current);
      }
    };
  }, []);

  function preventDragHandler(e) {
    e.preventDefault();
  }

  return (
    <div className="recentAchievements">
      <h2>{lang.recentAchievements[language].title}</h2>
      <div className="achievements">
        {!achievements ? (
          <BarLoader
            color="#ffffff"
            loading={true}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        ) : achievements.length > 0 ? (
          achievements
            .slice(-36)
            .reverse()
            .map((achievement, index) => (
              <div className="achievement" key={index}>
                {achievement.points >= 25 ? (
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 1.1 }}
                    >
                      <img
                        src={`https://retroachievements.org${achievement.badgeUrl}`}
                        onMouseEnter={(e) => handleMouseEnter(e, achievement)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onDragStart={preventDragHandler}
                      />
                    </motion.div>
                    {achievement.points >= 75 ? (
                      <video
                        src={"/assets/video/achievement.mp4"}
                        className="achievementBorder"
                        autoPlay
                        loop
                      />
                    ) : achievement.points >= 50 ? (
                      <video
                        src={"/assets/video/achievement.mp4"}
                        className="achievementBorder"
                        autoPlay
                        loop
                        style={{ filter: "hue-rotate(60deg) saturate(300%)" }}
                      />
                    ) : achievement.points >= 25 ? (
                      <video
                        src={"/assets/video/achievement.mp4"}
                        className="achievementBorder"
                        autoPlay
                        loop
                        style={{ filter: "hue-rotate(190deg) saturate(250%)" }}
                      />
                    ) : null}
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.1 }}
                    dragSnapToOrigin={true}
                  >
                    <img
                      src={`https://retroachievements.org${achievement.badgeUrl}`}
                      onMouseEnter={(e) => handleMouseEnter(e, achievement)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onDragStart={preventDragHandler}
                    />
                    {achievement.points >= 75 ? (
                      <video
                        src={"/assets/video/achievement.mp4"}
                        className="achievementBorder"
                        autoPlay
                        loop
                      />
                    ) : achievement.points >= 50 ? (
                      <video
                        src={"/assets/video/achievement.mp4"}
                        className="achievementBorder"
                        autoPlay
                        loop
                        style={{ filter: "hue-rotate(60deg)" }}
                      />
                    ) : achievement.points >= 25 ? (
                      <video
                        src={"/assets/video/achievement.mp4"}
                        className="achievementBorder"
                        autoPlay
                        loop
                        style={{ filter: "hue-rotate(190deg)" }}
                      />
                    ) : null}
                  </motion.div>
                )}
              </div>
            ))
        ) : (
          <p className="noRecent">No achievements in the last month.</p>
        )}
        {tooltip.visible && (
          <div
            className={`tooltip ${fade ? "fade-in" : "fade-out"}`}
            style={{
              top: tooltip.y + 15,
              left: tooltip.x + 15,
              ...(tooltip.content.points >= 75
                ? {
                    border: "1px solid #ff0000",
                    boxShadow: "0 0 10px #ff0000",
                  }
                : tooltip.content.points >= 50
                ? {
                    border: "1px solid #FF7C09",
                    boxShadow: "0 0 10px #FF7C09",
                  }
                : tooltip.content.points >= 25
                ? {
                    border: "1px solid #00abff",
                    boxShadow: "0 0 10px #00abff",
                  }
                : {}),
            }}
          >
            <strong>{tooltip.content.title}</strong>
            <p>{tooltip.content.points}</p>
            <p>{tooltip.content.description}</p>
            <p>{tooltip.content.gameTitle}</p>
            <p>{tooltip.content.consoleName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAchievements;
