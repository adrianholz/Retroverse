import React, { useContext } from "react";
import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import UserContext from "../../UserContext";
const { ipcRenderer } = require("electron");

const Sidebar = () => {
  const {
    login,
    data,
    player,
    changePlayer,
    changeSettings,
    setSearch,
    handleScrape,
  } = useContext(UserContext);

  function preventDragHandler(e) {
    e.preventDefault();
  }

  function handlePlayer() {
    changePlayer();
    window.localStorage.setItem("player", player);
  }

  function handleSettings() {
    changeSettings();
  }

  function handleSearch() {
    setSearch(true);
  }

  function handleClose() {
    ipcRenderer.send("close-app");
  }

  const location = useLocation();
  const pathname = location.pathname;
  const pathSegments = pathname.split("/");
  const emulatorName = pathSegments[pathSegments.length - 1];

  function handleFolder() {
    ipcRenderer.invoke("open-directory", emulatorName);
  }

  const songControls = document.querySelector(".songControls");

  if (player) {
    if (songControls) {
      songControls.style.opacity = "1";
      songControls.style.pointerEvents = "unset";
    }
  } else {
    if (songControls) {
      songControls.style.opacity = "0";
      songControls.style.pointerEvents = "none";
    }
  }

  return (
    <aside className="sidebar">
      <div>
        <Link to="/">
          {login ? (
            <img
              src={`https://retroachievements.org${data.userPic}`}
              className="userIcon"
              onDragStart={preventDragHandler}
            />
          ) : (
            <img src={"/assets/svg/user.svg"} alt="User Icon" />
          )}
        </Link>
        <div className="sidebarButtons">
          <img
            src={"/assets/svg/folder.svg"}
            alt="Folder"
            onClick={handleFolder}
            style={
              location.pathname.includes("/emulators/")
                ? { opacity: 1, pointerEvents: "unset" }
                : { opacity: 0, pointerEvents: "none" }
            }
          />
          <img
            src={"/assets/svg/search.svg"}
            alt="Search"
            onClick={handleSearch}
            style={
              location.pathname.includes("/emulators/")
                ? { opacity: 1, pointerEvents: "unset" }
                : { opacity: 0, pointerEvents: "none" }
            }
          />
          <img
            src={"/assets/svg/scrape.svg"}
            alt="Scrape"
            onClick={handleScrape}
          />
          <img
            src={"/assets/svg/music.svg"}
            alt="Music"
            onClick={handlePlayer}
          />
          <img
            src={"/assets/svg/gear.svg"}
            alt="Settings"
            onClick={handleSettings}
          />
          <img
            src={"/assets/svg/door-open.svg"}
            alt="Close"
            onClick={handleClose}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
