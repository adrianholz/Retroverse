import React, { useContext } from "react";
import UserContext from "../../UserContext";
import UserInfo from "./UserPanel/UserInfo";
import StatsSection from "./UserPanel/StatsSection";
import RecentGames from "./UserPanel/RecentGames";
import RecentAchievements from "./UserPanel/RecentAchievements";
import BarLoader from "react-spinners/BarLoader";
import Buttons from "./Buttons";
import lang from "../../Data/languages.json";
import "./UserProfile.css";

const UserProfile = () => {
  const {
    language,
    changeRefresh,
    userLogout,
    recentGames,
    awards,
    achievements,
    data,
  } = useContext(UserContext);

  const d = new Date();

  return (
    <>
      <div className="container">
        <div className="userPanel">
          <UserInfo data={data} d={d} lang={lang} language={language} />
          <StatsSection
            awards={awards}
            data={data}
            lang={lang}
            language={language}
          />
          <RecentGames
            recentGames={recentGames}
            lang={lang}
            language={language}
          />
          <RecentAchievements
            achievements={achievements}
            lang={lang}
            language={language}
          />
          <Buttons
            userLogout={userLogout}
            changeRefresh={changeRefresh}
            lang={lang}
            language={language}
          />
        </div>
      </div>
    </>
  );
};

export default UserProfile;
