import React from "react";
import { Link } from "react-router-dom";

const Buttons = ({ userLogout, lang, language }) => (
  <div className="buttons">
    <button onClick={() => userLogout()}>
      {lang.buttons[language].logout}
    </button>
    <Link to="/emulators">
      <button>{lang.buttons[language].library}</button>
    </Link>
  </div>
);

export default Buttons;
