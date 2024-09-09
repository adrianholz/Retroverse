import React from "react";
import BarLoader from "react-spinners/BarLoader";

const RecentGames = ({ recentGames, lang, language }) => (
  <div className="recentGames">
    <h2>{lang.recentGames[language].title}</h2>
    <div className="games">
      {!recentGames ? (
        <BarLoader
          color="#ffffff"
          loading={true}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : recentGames.length > 0 ? (
        recentGames.map((game, index) => (
          <div
            className="game"
            key={index}
            style={{
              backgroundImage: `url(https://retroachievements.org${game.imageTitle})`,
              border:
                game.numAchievedHardcore === game.numPossibleAchievements &&
                game.numPossibleAchievements != 0
                  ? "2px solid gold"
                  : "none",
            }}
          >
            {game.numAchievedHardcore === game.numPossibleAchievements &&
            game.numPossibleAchievements != 0 ? (
              <img
                src={"/assets/png/misc/badge.png"}
                className="completedGame"
              />
            ) : null}
            <div className="gameInfo">
              <img
                src={`https://retroachievements.org${game.imageIcon}`}
                alt="Game Icon"
              />
              <div>
                <div>
                  <h2>{game.title}</h2>
                  <h3>{game.consoleName}</h3>
                </div>
                <p>
                  <span>{game.numAchievedHardcore}</span>{" "}
                  {lang.recentGames[language].outOf}{" "}
                  <span>{game.numPossibleAchievements}</span>{" "}
                  {lang.recentGames[language].unlocked}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="noRecent">{lang.recentGames[language].noRecent}</p>
      )}
    </div>
  </div>
);

export default RecentGames;
