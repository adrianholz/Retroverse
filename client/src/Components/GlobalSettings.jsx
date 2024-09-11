import React, { useContext, useState, useEffect } from "react";
const { ipcRenderer } = require("electron");
import lang from "../Data/languages.json";
import "./GlobalSettings.css";
import UserContext from "../UserContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import BarLoader from "react-spinners/BarLoader";

const GlobalSettings = () => {
  const {
    language,
    changeLanguage,
    changeSettings,
    settings,
    setMusicVolume,
    musicVolume,
    setSfxVolume,
    sfxVolume,
    emulatorData,
  } = useContext(UserContext);

  // Ensure emulatorData is available before rendering
  if (!emulatorData || Object.keys(emulatorData).length === 0) {
    return (
      <BarLoader
        color="#ffffff"
        loading={true}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    );
  }

  // Convert emulatorData object to an array
  const allEmulators = Object.values(emulatorData);

  const getInitialActiveEmulators = () => {
    const activeEmulatorsString =
      window.localStorage.getItem("activeEmulators");
    if (activeEmulatorsString) {
      const activeEmulatorNames = activeEmulatorsString
        .split(", ")
        .map((name) => name.trim());
      return allEmulators.filter((emulator) =>
        activeEmulatorNames.includes(emulator.name)
      );
    }
    return [emulatorData.snes]; // Default value if nothing is found in local storage
  };

  const getInitialDisabledEmulators = (activeEmulators) => {
    const activeEmulatorNames = activeEmulators.map(
      (emulator) => emulator.name
    );
    return allEmulators.filter(
      (emulator) => !activeEmulatorNames.includes(emulator.name)
    );
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ipcRenderer.on("loading", (event, isLoading) => {
      setLoading(isLoading);
    });

    return () => {
      ipcRenderer.removeAllListeners("loading");
    };
  }, []);

  const [activeEmulators, setActiveEmulators] = useState(
    getInitialActiveEmulators()
  );
  const [disabledEmulators, setDisabledEmulators] = useState(
    getInitialDisabledEmulators(getInitialActiveEmulators())
  );

  useEffect(() => {
    setDisabledEmulators(getInitialDisabledEmulators(activeEmulators));
  }, [activeEmulators]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const items =
        source.droppableId === "activeEmulators"
          ? Array.from(activeEmulators)
          : Array.from(disabledEmulators);
      const [movedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, movedItem);

      source.droppableId === "activeEmulators"
        ? setActiveEmulators(items)
        : setDisabledEmulators(items);
    } else {
      let sourceItems, setSourceItems, destinationItems, setDestinationItems;

      if (source.droppableId === "activeEmulators") {
        sourceItems = Array.from(activeEmulators);
        setSourceItems = setActiveEmulators;
        destinationItems = Array.from(disabledEmulators);
        setDestinationItems = setDisabledEmulators;
      } else {
        sourceItems = Array.from(disabledEmulators);
        setSourceItems = setDisabledEmulators;
        destinationItems = Array.from(activeEmulators);
        setDestinationItems = setActiveEmulators;
      }

      const [movedItem] = sourceItems.splice(source.index, 1);
      destinationItems.splice(destination.index, 0, movedItem);

      setSourceItems(sourceItems);
      setDestinationItems(destinationItems);
    }
  };

  function activateAllEmulators() {
    setActiveEmulators([...activeEmulators, ...disabledEmulators]);
    setDisabledEmulators([]);
  }

  function deactivateAllEmulators() {
    setDisabledEmulators([...disabledEmulators, ...activeEmulators]);
    setActiveEmulators([]);
  }

  const handleEmulatorClick = (
    emulator,
    sourceList,
    setSourceList,
    targetList,
    setTargetList
  ) => {
    setSourceList(sourceList.filter((item) => item.name !== emulator.name));
    setTargetList([...targetList, emulator]);
  };

  function handleClose() {
    changeSettings();

    // Get volume settings from localStorage
    const musicVol = window.localStorage.getItem("musicvol");
    const sfxVol = window.localStorage.getItem("sfxvol");
    const musicVolInput = document.querySelector("#musicVolume");
    const sfxVolInput = document.querySelector("#sfxVolume");

    // Set the volume input values
    musicVolInput.value = musicVol ? Number(musicVol) * 100 : 50;
    sfxVolInput.value = sfxVol ? Number(sfxVol) * 100 : 50;

    // Get the screen value from localStorage and set the active class
    const screen = window.localStorage.getItem("screen");

    document.querySelectorAll(".screen ul li").forEach((item) => {
      if (item.dataset.value === screen) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Get the language from localStorage and set the active class
    const lang = window.localStorage.getItem("lang");

    document.querySelectorAll(".lang img").forEach((image) => {
      if (image.dataset.lang === lang) {
        image.classList.add("active");
      } else {
        image.classList.remove("active");
      }
    });
  }

  function handleSave() {
    changeSettings();

    // Save volume settings to localStorage
    window.localStorage.setItem("musicvol", musicVolume);
    window.localStorage.setItem("sfxvol", sfxVolume);
    window.localStorage.setItem(
      "activeEmulators",
      activeEmulators.map((emulator) => emulator.name).join(", ")
    );

    // Save the active screen to localStorage
    const activeScreen = document.querySelector(".screen ul li.active")?.dataset
      .value;
    if (activeScreen) {
      window.localStorage.setItem("screen", activeScreen);
      ipcRenderer.send("set-window-mode", activeScreen);
    }

    // Save the current language to localStorage
    const activeLang = document.querySelector(".lang img.active")?.dataset.lang;
    if (activeLang) {
      window.localStorage.setItem("lang", activeLang);
      changeLanguage(activeLang);
    }
  }

  // Remove changeLanguage from handleLanguage function
  function handleLanguage({ target }) {
    document.querySelectorAll(".lang img").forEach((image) => {
      image.classList.remove("active");
    });
    target.classList.add("active");
  }

  function handleScreen({ target }) {
    document.querySelectorAll(".screen ul li").forEach((item) => {
      item.classList.remove("active");
    });
    target.classList.add("active");
  }

  useEffect(() => {
    const screen = window.localStorage.getItem("screen");
    const lang = window.localStorage.getItem("lang");

    if (screen) {
      ipcRenderer.send("set-window-mode", screen);
    } else {
      ipcRenderer.send("set-window-mode", "Fullscreen");
    }

    if (lang) {
      changeLanguage(lang);
    }

    const activeScreen = document.querySelector(
      `.screen ul li[data-value="${screen || "Fullscreen"}"]`
    );

    const activeLang = document.querySelector(
      `.lang img[data-lang="${lang || "en-us"}"]`
    );

    if (activeScreen) {
      activeScreen.classList.add("active");
    } else {
      document
        .querySelector(".screen ul li[data-value='Fullscreen']")
        .classList.add("active");
    }

    if (activeLang) {
      activeLang.classList.add("active");
    } else {
      document
        .querySelector(".lang img[data-lang='en-us']")
        .classList.add("active");
    }
  }, [settings]);

  return (
    <div
      className="modal"
      style={
        settings
          ? { opacity: "1", pointerEvents: "unset" }
          : { opacity: "0", pointerEvents: "none" }
      }
    >
      <div>
        <h1>{lang.globalSettings[language].title}</h1>
        <div className="settings-inner">
          <div className="volume">
            <div>
              <label htmlFor="musicVolume">
                {lang.globalSettings[language].music}
              </label>
              <input
                type="range"
                id="musicVolume"
                min="0"
                max="100"
                defaultValue={
                  window.localStorage.getItem("musicvol")
                    ? Number(window.localStorage.getItem("musicvol")) * 100
                    : 50
                }
                onChange={({ target }) => {
                  setMusicVolume(target.value / 100);
                }}
              />
            </div>
            <div>
              <label htmlFor="sfxVolume">
                {lang.globalSettings[language].sfx}
              </label>
              <input
                type="range"
                id="sfxVolume"
                min="0"
                max="100"
                defaultValue={
                  window.localStorage.getItem("sfxvol")
                    ? Number(window.localStorage.getItem("sfxvol")) * 100
                    : 50
                }
                onChange={({ target }) => {
                  setSfxVolume(target.value / 100);
                }}
              />
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="consoles">
              <div className="consolesLayout">
                <Droppable droppableId="activeEmulators">
                  {(provided) => (
                    <div className="activeEmulators">
                      <h2>{lang.globalSettings[language].activeEmulators}</h2>
                      <button
                        onClick={deactivateAllEmulators}
                        style={
                          activeEmulators.length >= 1
                            ? { opacity: 1, transform: "translateX(0)" }
                            : { opacity: 0, transform: "translateX(10px)" }
                        }
                      >
                        &#8649;
                      </button>
                      <div
                        className="activeEmulatorsInner"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {activeEmulators.map((emulator, index) => (
                          <Draggable
                            key={emulator.name}
                            draggableId={emulator.name}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() =>
                                  handleEmulatorClick(
                                    emulator,
                                    activeEmulators,
                                    setActiveEmulators,
                                    disabledEmulators,
                                    setDisabledEmulators
                                  )
                                }
                              >
                                <img
                                  src={`/assets/png/logo/${emulator.name}-logo.png`}
                                  alt={emulator.title}
                                />
                                <h3>{emulator.title}</h3>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
                <span></span>
                <Droppable droppableId="disabledEmulators">
                  {(provided) => (
                    <div className="disabledEmulators">
                      <h2>{lang.globalSettings[language].inactiveEmulators}</h2>
                      <button
                        onClick={activateAllEmulators}
                        style={
                          disabledEmulators.length >= 1
                            ? { opacity: 1, transform: "translateX(0)" }
                            : { opacity: 0, transform: "translateX(10px)" }
                        }
                      >
                        &#8647;
                      </button>
                      <div
                        className="disabledEmulatorsInner"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {disabledEmulators.map((emulator, index) => (
                          <Draggable
                            key={emulator.name}
                            draggableId={emulator.name}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() =>
                                  handleEmulatorClick(
                                    emulator,
                                    disabledEmulators,
                                    setDisabledEmulators,
                                    activeEmulators,
                                    setActiveEmulators
                                  )
                                }
                              >
                                <img
                                  src={`/assets/png/logo/${emulator.name}-logo.png`}
                                  alt={emulator.title}
                                />
                                <h3>{emulator.title}</h3>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
          <div className="langScreen">
            <div className="softwares">
              <h2>Softwares</h2>
              <ul>
                <li
                  onClick={() => {
                    ipcRenderer.send("run-retroarch-config");
                  }}
                >
                  <img src={"/assets/svg/Retroarch.svg"} alt="Retroarch" />
                  <p>RetroArch</p>
                </li>
              </ul>
            </div>
            <div className="screen">
              <h2>{lang.globalSettings[language].screen}</h2>
              <ul>
                <li onClick={handleScreen} data-value="Fullscreen">
                  {lang.globalSettings[language].fullscreen}
                </li>
                <li onClick={handleScreen} data-value="Windowed">
                  {lang.globalSettings[language].windowed}
                </li>
              </ul>
            </div>
            <div className="lang">
              <h2>{lang.globalSettings[language].language}</h2>
              <ul>
                <li>
                  <img
                    src={"./assets/svg/usflag.svg"}
                    alt="English"
                    data-lang="en-us"
                    onClick={handleLanguage}
                  />
                </li>
                <li>
                  <img
                    src={"./assets/svg/brflag.svg"}
                    alt="Brazilian Portuguese"
                    data-lang="pt-br"
                    onClick={handleLanguage}
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="buttons">
          <button onClick={handleClose}>
            {lang.globalSettings[language].close}
          </button>
          <button onClick={handleSave}>
            {lang.globalSettings[language].save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
