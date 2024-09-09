import React from "react";
import BarLoader from "react-spinners/BarLoader";

const StatsSection = ({ awards, data, lang, language }) => (
  <div className="stats">
    <div className="statsSection">
      <div className="stat">
        <h3>{lang.statsSection[language].joined}</h3>
        <span>
          {data.memberSince
            .slice(0, 7)
            .split("-")
            .reverse()
            .toString()
            .replace(",", "/")}
        </span>
      </div>
      <div className="stat">
        <h3>{lang.statsSection[language].points}</h3>
        <span>{data.totalPoints}</span>
      </div>
      <div className="stat">
        <h3>{lang.statsSection[language].rank}</h3>
        <span>
          {data.rank ? data.rank : lang.statsSection[language].noRank}
        </span>
      </div>
    </div>
    <span></span>
    <div className="statsSection">
      {!awards ? (
        <BarLoader
          color="#ffffff"
          loading={true}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : (
        <>
          <div className="stat">
            <h3>{lang.statsSection[language].awards}</h3>
            <span>{awards.totalAwardsCount}</span>
          </div>
          <div className="stat">
            <h3>{lang.statsSection[language].games}</h3>
            <span>{awards.beatenHardcoreAwardsCount}</span>
          </div>
          <div className="stat">
            <h3>{lang.statsSection[language].mastered}</h3>
            <span>{awards.masteryAwardsCount}</span>
          </div>
        </>
      )}
    </div>
  </div>
);

export default StatsSection;
