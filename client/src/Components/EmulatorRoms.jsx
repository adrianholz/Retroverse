import React, { useContext, useEffect, useState, useRef } from "react";
import lang from "../Data/languages.json";
const { ipcRenderer } = window.require("electron");
import { motion } from "framer-motion";
import "./EmulatorRoms.css";
import { useNavigate, useParams } from "react-router-dom";
import xml2js from "xml2js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard } from "swiper/modules";
import Atropos from "atropos/react";
import BarLoader from "react-spinners/BarLoader";
import "atropos/css";
import "swiper/css";
import UserContext from "../UserContext.jsx";
import "./Stars.scss";

const EmulatorRoms = () => {
  const { emulatorName } = useParams();
  const [core, setCore] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [emulatorDat, setEmulatorDat] = useState("");
  const [rawXml, setRawXml] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [boxArt, setBoxArt] = useState(false);
  const [video, setVideo] = useState(false);
  const [imagesMix, setImagesMix] = useState(false);
  const [gameArray, setGameArray] = useState([]);
  const [searchGames, setSearchGames] = useState(null);
  const [query, setQuery] = useState("");
  const swiperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const {
    emulatorData,
    pauseSong,
    setPauseSong,
    search,
    setSearch,
    handleScrape,
    language,
  } = useContext(UserContext);

  useEffect(() => {
    setCore(emulatorData[emulatorName]?.core);
    setEmulatorDat(emulatorData[emulatorName]?.emulatorDat);
  }, [emulatorName]);

  useEffect(() => {
    if (!emulatorDat) return;

    const fetchDatFile = async () => {
      try {
        const response = await fetch(
          `/roms/${emulatorName}/${emulatorDat}.dat`
        );
        const xmlText = await response.text();

        if (xmlText.includes("<!DOCTYPE html>")) {
          console.warn("Received HTML content instead of XML. Retrying...");
          return;
        }

        setRawXml(xmlText);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the .dat file:", error);
      }
    };

    const timeoutId = setTimeout(fetchDatFile, 100);

    return () => clearTimeout(timeoutId);
  }, [emulatorDat, emulatorName]);

  useEffect(() => {
    if (!rawXml) return;

    const parseXml = () => {
      const parser = new xml2js.Parser({
        explicitArray: false,
        strict: false,
      });

      parser.parseString(rawXml, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          return;
        }
        if (Array.isArray(result.DATAFILE?.GAME)) {
          result.DATAFILE.GAME.sort((a, b) => {
            return a.$.NAME.localeCompare(b.$.NAME);
          });
        }

        setMetadata(result);
      });
    };

    parseXml();
  }, [rawXml]);

  useEffect(() => {
    if (metadata !== null && Array.isArray(metadata.DATAFILE?.GAME)) {
      const gamesAmount = gameArray.length;
      const gamesToAdd = metadata.DATAFILE.GAME.slice(
        gamesAmount,
        gamesAmount + 8
      );

      setGameArray((state) => [...state, ...gamesToAdd]);
    }
  }, [metadata]);

  const filteredGames = metadata?.DATAFILE?.GAME
    ? searchGames && Array.isArray(metadata.DATAFILE.GAME)
      ? metadata.DATAFILE.GAME.filter((game) =>
          game.ROM?.$.NAME.toLowerCase().includes(searchGames.toLowerCase())
        )
      : metadata.DATAFILE.GAME
    : [];

  useEffect(() => {
    if (filteredGames.length > 0) {
      const gameTitle = Array.isArray(filteredGames)
        ? filteredGames[activeIndex]?.ROM?.$.NAME
        : filteredGames.ROM.$.NAME;

      setTitle(gameTitle);
    } else {
      setTitle(metadata?.DATAFILE?.GAME.ROM?.$.NAME);
    }
  }, [activeIndex, filteredGames]);

  useEffect(() => {
    setGameArray([]); // Reset gameArray to allow lazy loading to work again

    if (swiperRef.current) {
      swiperRef.current.slideTo(0); // Reset to the first slide
    }

    // Trigger the initial loading of the first batch of filtered games
    const filteredGames = metadata?.DATAFILE?.GAME
      ? searchGames && Array.isArray(metadata.DATAFILE.GAME)
        ? metadata.DATAFILE.GAME.filter((game) =>
            game.ROM?.$.NAME.toLowerCase().includes(searchGames.toLowerCase())
          )
        : metadata.DATAFILE.GAME
      : [];

    if (Array.isArray(filteredGames)) {
      const gamesToAdd = filteredGames.slice(0, 8);
      setGameArray(gamesToAdd);
    } else {
      setGameArray(filteredGames);
    }
  }, [searchGames, metadata]);

  const handleKeyPress = (event) => {
    if (
      event.key === "Enter" &&
      !event.target.closest(".searchContainer") &&
      !search
    ) {
      ipcRenderer.send("run-retroarch", core, title, emulatorName);
      handlePlay();
    } else if (event.key === "s" && !search) {
      setSearch(true);
      setImagesMix(false);
      setBoxArt(false);
      setVideo(false);
    } else if (event.key === "Escape") {
      if (search || imagesMix || boxArt || video) {
        const timeoutId = setTimeout(() => {
          setSearch(false);
          setImagesMix(false);
          setBoxArt(false);
          setVideo(false);
          clearTimeout(timeoutId); // Cleanup timeout
        }, 10);
      } else {
        navigate("/emulators");
      }
    }
  };

  useEffect(() => {
    let timeoutId;

    if (search && inputRef.current) {
      timeoutId = setTimeout(() => {
        inputRef.current.focus();
      }, 10);
      inputRef.current.value = "";
      setQuery("");
    } else {
      inputRef.current.blur();
    }

    // Cleanup function to clear the timeout
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchGames(query);
    if (
      inputRef.current.value !== "" &&
      Array.isArray(metadata?.DATAFILE?.GAME)
    ) {
      setTitle("");
    }
    setSearch(false);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [core, title, emulatorName, search, imagesMix, boxArt, video]);

  const getVideoSrc = (gameName) => {
    return `/roms/${emulatorName}/media/videos/${gameName}.mp4`;
  };

  const getBoxFrontSrc = (gameName) => {
    return `/roms/${emulatorName}/media/box2dfront/${gameName}.png`;
  };
  const getBoxBackSrc = (gameName) => {
    return `/roms/${emulatorName}/media/box2dback/${gameName}.png`;
  };
  const getScreenshot = (gameName) => {
    return `/roms/${emulatorName}/media/screenshot/${gameName}.png`;
  };
  const get3dBox = (gameName) => {
    return `/roms/${emulatorName}/media/box3d/${gameName}.png`;
  };
  const getSupport = (gameName) => {
    return `/roms/${emulatorName}/media/support/${gameName}.png`;
  };
  const getWheel = (gameName) => {
    return `/roms/${emulatorName}/media/wheel/${gameName}.png`;
  };

  const getVideoOrEmpty = (gameName, isActive) => {
    return isActive ? getVideoSrc(gameName) : "";
  };

  const style = emulatorData[emulatorName]?.styles || {
    swiperslide: {
      maxWidth: "440px",
      transform: "translateY(93%)",
    },
    gameInfo: {
      right: "-113%",
      bottom: "20px",
    },
  };

  function handleNavigate() {
    navigate("/emulators");
  }

  function preventDragHandler(e) {
    e.preventDefault();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    ipcRenderer.on("retroarch-closed", (event, code) => {
      console.log(`RetroArch process closed with code ${code}`);
      handleRetroArchClosed();
    });

    ipcRenderer.on("retroarch-failed", () => {
      console.log(`RetroArch process failed to open`);
      setError(true);
    });

    return () => {
      ipcRenderer.removeAllListeners("retroarch-closed");
      ipcRenderer.removeAllListeners("retroarch-failed");
    };
  }, []);

  function handlePlay() {
    const elements = document.querySelectorAll(
      ".swiper-slide:not(.swiper-slide-active), .gameButtons, .gameInfo, .swiper"
    );
    elements.forEach((element) => {
      element.classList.add("playing");
    });
    if (!pauseSong) {
      setPauseSong(true);
    }
  }

  function handleRetroArchClosed() {
    const elements = document.querySelectorAll(
      ".swiper-slide:not(.swiper-slide-active), .gameButtons, .gameInfo, .swiper"
    );
    elements.forEach((element) => {
      element.classList.remove("playing");
    });
    const pause = window.localStorage.getItem("pause");
    if (pause == "false") {
      setPauseSong(false);
    }
  }

  function slideLazyLoad() {
    const filteredGames = searchGames
      ? metadata.DATAFILE.GAME.filter((game) =>
          game.ROM?.$.NAME.toLowerCase().includes(searchGames.toLowerCase())
        )
      : metadata.DATAFILE.GAME;

    const gamesLeftAmount = filteredGames.length - gameArray.length;
    if (gamesLeftAmount !== 0) {
      const isKeySlide = activeIndex === gameArray.length - 4;
      if (isKeySlide) {
        const cutNumber =
          gamesLeftAmount > 5
            ? gameArray.length + 1
            : gameArray.length + gamesLeftAmount;
        const gamesToAdd = filteredGames.slice(gameArray.length, cutNumber);
        setGameArray((state) => [...state, ...gamesToAdd]);
      }
    }
  }

  function handleSlideChange(swiper) {
    setActiveIndex(swiper.activeIndex);
    slideLazyLoad();
  }

  return (
    <>
      <div className="emulatorIntro">
        <img
          src={`/assets/png/banner/${emulatorName}-banner.png`}
          alt="Emulator Banner"
          className="emulatorBanner"
        />
        <img
          src={`/assets/png/logo/${emulatorName}-logo.png`}
          alt="Emulator Logo"
          className="emulatorLogo"
        />
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <div
        className="romsContainer"
        style={{
          opacity: opacity,
          transition: "opacity 1s",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ height: "100%" }}
        >
          <motion.div exit={{ y: 100 }} transition={{ duration: 0.3 }}>
            <button className="back" onClick={handleNavigate}>
              <img
                src={"/assets/svg/gamepad.svg"}
                alt="Back"
                onDragStart={preventDragHandler}
              />
              <p>{lang.emulatorRoms[language].library}</p>
            </button>
          </motion.div>
          <div className="container">
            <div
              className="initError"
              onClick={() => setError(false)}
              style={
                error
                  ? { opacity: "1", pointerEvents: "unset" }
                  : { opacity: "0", pointerEvents: "none" }
              }
            >
              <div>
                <h2>{lang.emulatorRoms[language].initialization}</h2>
                <span>{lang.emulatorRoms[language].gameFailed}</span>
                <ol>
                  <li>
                    {lang.emulatorRoms[language].step1_1}
                    <strong>{title}</strong>
                    {lang.emulatorRoms[language].step1_2}
                  </li>
                  <li>
                    {lang.emulatorRoms[language].step2_1}
                    <strong>{core}</strong>
                    {lang.emulatorRoms[language].step2_2}
                    <strong>{emulatorDat}</strong>
                    {lang.emulatorRoms[language].step2_3}(
                    <img src="/assets/svg/gear.svg" />
                    ).
                  </li>
                  <li>
                    {lang.emulatorRoms[language].step3_1}
                    <strong>{core}</strong>
                    {lang.emulatorRoms[language].step3_2}
                    <strong>{emulatorDat}</strong>
                    {lang.emulatorRoms[language].step3_3}
                    <strong>emulators.json</strong>
                    {lang.emulatorRoms[language].step3_4}
                  </li>
                  <li>
                    {lang.emulatorRoms[language].step4_1}
                    <strong>{core}</strong>
                    {lang.emulatorRoms[language].step4_2}
                  </li>
                  <li>
                    {lang.emulatorRoms[language].step5_1}
                    <strong>{emulatorDat}</strong>
                    {lang.emulatorRoms[language].step5_2}
                  </li>
                </ol>
              </div>
            </div>

            {title && (
              <video
                src={getVideoSrc(title?.replace(/\.[^/.]+$/, "") || "")}
                autoPlay
                loop
                muted
                className="gameVideo"
              />
            )}

            <div
              className="boxart"
              style={
                boxArt
                  ? { opacity: "1", pointerEvents: "unset" }
                  : { opacity: "0", pointerEvents: "none" }
              }
              onClick={() => setBoxArt(false)}
            >
              <Atropos className="atropos">
                <img
                  src={getBoxFrontSrc(title?.replace(/\.[^/.]+$/, "") || "")}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/assets/png/fallback/box2dfront.png";
                  }}
                  alt="Front Box Art"
                  style={
                    boxArt
                      ? { transform: "scale(1)" }
                      : { transform: "scale(0)" }
                  }
                  onDragStart={preventDragHandler}
                />
              </Atropos>
              <Atropos className="atropos">
                <img
                  src={getBoxBackSrc(title?.replace(/\.[^/.]+$/, "") || "")}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/assets/png/fallback/box2dback.png";
                  }}
                  alt="Back Box Art"
                  style={
                    boxArt
                      ? { transform: "scale(1)", transitionDelay: "0.2s" }
                      : { transform: "scale(0)" }
                  }
                  onDragStart={preventDragHandler}
                />
              </Atropos>
            </div>

            <div
              className="video"
              style={
                video
                  ? { opacity: "1", pointerEvents: "unset" }
                  : {
                      opacity: "0",
                      pointerEvents: "none",
                      transitionDelay: ".225s",
                    }
              }
              onClick={() => setVideo(false)}
            >
              <div
                className="video-inner"
                style={
                  video
                    ? { transform: "scale(1)" }
                    : { transitionDelay: ".225s", transform: "scale(0)" }
                }
              >
                <img src={"/assets/png/misc/crt.png"} alt="CRT TV" />
                <video
                  src={"/assets/video/static.mp4"}
                  className="static"
                  autoPlay
                  loop
                  muted
                  style={
                    video
                      ? { transitionDelay: ".225s", opacity: "0" }
                      : { opacity: "1" }
                  }
                />
                <video
                  src={getVideoSrc(title?.replace(/\.[^/.]+$/, "") || "")}
                  autoPlay
                  loop
                  muted
                />
              </div>
            </div>

            <div
              className="imagesMix"
              style={
                imagesMix
                  ? { opacity: "1", pointerEvents: "unset" }
                  : { opacity: "0", pointerEvents: "none" }
              }
              onClick={() => setImagesMix(false)}
            >
              <div
                className="imagesMixContainer"
                style={
                  imagesMix
                    ? { transform: "scale(100%)" }
                    : { transform: "scale(0%)" }
                }
              >
                <Atropos className="images" shadow={false} highlight={false}>
                  <img
                    src={getScreenshot(title?.replace(/\.[^/.]+$/, "") || "")}
                    alt="Game Screenshot"
                    data-atropos-offset="-5"
                    onDragStart={preventDragHandler}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/assets/png/fallback/screenshot.png";
                    }}
                  />
                  <img
                    src={get3dBox(title?.replace(/\.[^/.]+$/, "") || "")}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/assets/png/fallback/box3d.png";
                    }}
                    alt="Game 3D Box"
                    data-atropos-offset="5"
                    onDragStart={preventDragHandler}
                  />
                  <img
                    src={getSupport(title?.replace(/\.[^/.]+$/, "") || "")}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/assets/png/fallback/support.png";
                    }}
                    alt="Game Support"
                    data-atropos-offset="15"
                    onDragStart={preventDragHandler}
                  />
                  <img
                    src={getWheel(title?.replace(/\.[^/.]+$/, "") || "")}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/assets/png/fallback/wheel.png";
                    }}
                    alt="Game Wheel"
                    data-atropos-offset="5"
                    onDragStart={preventDragHandler}
                  />
                </Atropos>
              </div>
            </div>

            <div
              className="search"
              style={
                search
                  ? { opacity: 1, pointerEvents: "unset" }
                  : { opacity: 0, pointerEvents: "none" }
              }
              onClick={({ target }) => {
                if (!target.closest(".searchContainer")) {
                  setSearch(false);
                }
              }}
              onKeyDown={handleKeyPress}
            >
              <form className="searchContainer" onSubmit={handleSubmit}>
                <img src={"/assets/svg/search.svg"} alt="Search" />
                <input
                  type="text"
                  name="searchInput"
                  placeholder="Search for games..."
                  ref={inputRef}
                  max="20"
                  onChange={({ target }) => {
                    setQuery(target.value);
                  }}
                />
                <input type="submit" value={"Search"} />
              </form>
            </div>

            {metadata?.DATAFILE?.GAME ? (
              Array.isArray(metadata.DATAFILE.GAME) ? (
                gameArray && gameArray.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    exit={{ y: 300 }}
                  >
                    <Swiper
                      onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                      }}
                      grabCursor={true}
                      centeredSlides={true}
                      slidesPerView={"auto"}
                      speed={600}
                      modules={[Keyboard]}
                      keyboard={{ enabled: true }}
                      onSlideChange={(swiper) => {
                        handleSlideChange(swiper);
                      }}
                      longSwipes={false}
                    >
                      {gameArray.map((game, index) => (
                        <SwiperSlide
                          key={String(game?.$.NAME).replace("_", ":")}
                          style={style.swiperslide}
                        >
                          <h1>
                            {game.ROM?.$.NAME.replace(/\.[^/.]+$/, "") || ""}
                          </h1>

                          <img
                            src={`/roms/${emulatorName}/media/wheel/${game.ROM?.$.NAME.replace(
                              /\.[^/.]+$/,
                              ""
                            )}.png`}
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null;
                              currentTarget.src =
                                "/assets/png/fallback/wheel.png";
                            }}
                            alt="Game Logo"
                            className="gameLogo"
                            onDragStart={preventDragHandler}
                          />
                          <div
                            className="play"
                            onClick={() => {
                              ipcRenderer.send(
                                "run-retroarch",
                                core,
                                title,
                                emulatorName
                              );
                              handlePlay();
                            }}
                          >
                            <div>
                              <img
                                src={"/assets/svg/gamepad-light.svg"}
                                alt="Gamepad Light"
                              />
                              <h2>{lang.emulatorRoms[language].play}</h2>
                            </div>
                            <img
                              src={`/roms/${emulatorName}/media/support/${game.ROM?.$.NAME.replace(
                                /\.[^/.]+$/,
                                ""
                              )}.png`}
                              onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src =
                                  "/assets/png/fallback/support.png";
                              }}
                              alt="Game Support Image"
                              className="gameSupport"
                            />
                          </div>

                          <div className="gameButtons">
                            <img
                              src={"/assets/svg/image.svg"}
                              alt="Screenshot"
                              onClick={() => setImagesMix(true)}
                              onDragStart={preventDragHandler}
                            />
                            <img
                              src={"/assets/svg/images.svg"}
                              alt="Box Art"
                              onClick={() => setBoxArt(true)}
                              onDragStart={preventDragHandler}
                            />
                            <img
                              src={"/assets/svg/film.svg"}
                              alt="Video"
                              onClick={() => setVideo(true)}
                              onDragStart={preventDragHandler}
                            />
                          </div>

                          <div className="gameInfo" style={style.gameInfo}>
                            <video
                              src={getVideoOrEmpty(
                                game.ROM?.$.NAME.replace(/\.[^/.]+$/, ""),
                                index === activeIndex
                              )}
                              autoPlay
                              loop
                              muted
                              className="gameVideoInner"
                            />
                            <div className="gameDescription">
                              <h2>{String(game?.$.NAME).replace("_", ":")}</h2>
                              <span>
                                <strong>{game.YEAR}</strong> |{" "}
                                <strong>{game.MANUFACTURER}</strong>
                              </span>
                              <p>{game.DESCRIPTION}</p>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </motion.div>
                ) : (
                  <div className="error">
                    <h1>{lang.emulatorRoms[language].noGames}</h1>
                    <p>
                      {lang.emulatorRoms[language].match}{" "}
                      <strong>{query}</strong>{" "}
                      {lang.emulatorRoms[language].found}{" "}
                      <strong>{emulatorDat}</strong>. <br />
                      {lang.emulatorRoms[language].check} {query}{" "}
                      {lang.emulatorRoms[language].present} {emulatorDat}.dat.{" "}
                      <br />
                      {lang.emulatorRoms[language].ifNot}{" "}
                      <a onClick={handleScrape}>
                        {lang.emulatorRoms[language].scrape2}
                      </a>{" "}
                      {lang.emulatorRoms[language].scrape3}
                    </p>
                  </div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  exit={{ y: 300 }}
                >
                  <Swiper
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={"auto"}
                    speed={600}
                    modules={[Keyboard]}
                    keyboard={{ enabled: true }}
                    onSlideChange={(swiper) => {
                      handleSlideChange(swiper);
                    }}
                    longSwipes={false}
                  >
                    <SwiperSlide style={style.swiperslide}>
                      <h1>
                        {metadata.DATAFILE.GAME.ROM?.$.NAME.replace(
                          /\.[^/.]+$/,
                          ""
                        )}
                      </h1>

                      <img
                        src={`/roms/${emulatorName}/media/wheel/${metadata.DATAFILE.GAME.ROM?.$.NAME.replace(
                          /\.[^/.]+$/,
                          ""
                        )}.png`}
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = "/assets/png/fallback/wheel.png";
                        }}
                        alt="Game Logo"
                        className="gameLogo"
                        onDragStart={preventDragHandler}
                      />

                      <div
                        className="play"
                        onClick={() => {
                          ipcRenderer.send(
                            "run-retroarch",
                            core,
                            title,
                            emulatorName
                          );
                          handlePlay();
                        }}
                      >
                        <div>
                          <img
                            src={"/assets/svg/gamepad-light.svg"}
                            alt="Gamepad Light"
                          />
                          <h2>Let's play!</h2>
                        </div>
                        <img
                          src={`/roms/${emulatorName}/media/support/${metadata.DATAFILE.GAME.ROM?.$.NAME.replace(
                            /\.[^/.]+$/,
                            ""
                          )}.png`}
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src =
                              "/assets/png/fallback/support.png";
                          }}
                          alt="Game Support Image"
                          className="gameSupport"
                        />
                      </div>

                      <div className="gameButtons">
                        <img
                          src={"/assets/svg/image.svg"}
                          alt="Screenshot"
                          onClick={() => setImagesMix(true)}
                          onDragStart={preventDragHandler}
                        />
                        <img
                          src={"/assets/svg/images.svg"}
                          alt="Box Art"
                          onClick={() => setBoxArt(true)}
                          onDragStart={preventDragHandler}
                        />
                        <img
                          src={"/assets/svg/film.svg"}
                          alt="Video"
                          onClick={() => setVideo(true)}
                          onDragStart={preventDragHandler}
                        />
                      </div>

                      <div className="gameInfo" style={style.gameInfo}>
                        <video
                          src={`/roms/${emulatorName}/media/videos/${metadata.DATAFILE.GAME.ROM?.$.NAME.replace(
                            /\.[^/.]+$/,
                            ""
                          )}.mp4`}
                          autoPlay
                          loop
                          muted
                          className="gameVideoInner"
                        />
                        <div className="gameDescription">
                          <h2>
                            {String(metadata.DATAFILE.GAME.$.NAME).replace(
                              "_",
                              ":"
                            )}
                          </h2>
                          <span>
                            <strong>{metadata.DATAFILE.GAME.YEAR}</strong> |{" "}
                            <strong>
                              {metadata.DATAFILE.GAME.MANUFACTURER}
                            </strong>
                          </span>
                          <p>{metadata.DATAFILE.GAME.DESCRIPTION}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </motion.div>
              )
            ) : loading ? (
              <BarLoader
                color="#ffffff"
                loading={true}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              <div className="error">
                {query ? (
                  <>
                    <h1>{lang.emulatorRoms[language].noGames}</h1>
                    <p>
                      {lang.emulatorRoms[language].match}{" "}
                      <strong>{query}</strong>{" "}
                      {lang.emulatorRoms[language].found}{" "}
                      <strong>{emulatorDat}</strong>. <br />
                      {lang.emulatorRoms[language].check} {query}{" "}
                      {lang.emulatorRoms[language].present} {emulatorDat}.dat.{" "}
                      <br />
                      {lang.emulatorRoms[language].ifNot}{" "}
                      <a onClick={handleScrape}>
                        {lang.emulatorRoms[language].scrape2}
                      </a>{" "}
                      {lang.emulatorRoms[language].scrape3}
                    </p>
                  </>
                ) : (
                  <>
                    <h1>{lang.emulatorRoms[language].noGames}</h1>
                    <p>
                      {lang.emulatorRoms[language].noROMs}{" "}
                      <strong>{emulatorDat}</strong>. <br />
                      {emulatorDat}
                      {lang.emulatorRoms[language].dat} <br />
                      {lang.emulatorRoms[language].scrape1}{" "}
                      <a onClick={handleScrape}>
                        {lang.emulatorRoms[language].scrape2}
                      </a>{" "}
                      {lang.emulatorRoms[language].scrape3}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default EmulatorRoms;
