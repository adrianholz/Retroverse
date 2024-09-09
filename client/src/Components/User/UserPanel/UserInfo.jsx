import React from "react";

const UserInfo = ({ data, d, language, lang }) => (
  <div className="title">
    <img
      src={`https://retroachievements.org${data.userPic}`}
      alt="User Picture"
    />
    <div>
      <span>
        {d.getHours() >= 6 && d.getHours() < 12
          ? lang.userInfo[language].morning
          : d.getHours() >= 12 && d.getHours() < 18
          ? lang.userInfo[language].afternoon
          : lang.userInfo[language].evening}
      </span>
      <h1>{data.user}</h1>
      <p>
        {data.motto ? data.motto : <i>{lang.userInfo[language].noMotto}</i>}
      </p>
    </div>
  </div>
);

export default UserInfo;
