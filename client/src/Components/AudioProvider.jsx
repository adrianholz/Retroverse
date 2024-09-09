import React, { useContext, useEffect, useRef, useState } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
const { ipcRenderer } = require("electron");
import { motion } from "framer-motion";
import "./AudioProvider.css";
import UserContext from "../UserContext";
import BarLoader from "react-spinners/BarLoader";

const AudioProvider = () => {
  const audioRef = useRef(null);
  const audioContainerRef = useRef(null);
  const audioMotionRef = useRef(null);
  const audioDragRef = useRef(null);
  const hasMounted = useRef(false);
  const [loading, setLoading] = useState(true);

  const [song, setSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { settings, setIsCarouselEnabled, pauseSong, setPauseSong } =
    useContext(UserContext);

  useEffect(() => {
    if (pauseSong) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  }, [pauseSong]);

  useEffect(() => {
    ipcRenderer.on("loading", (event, isLoading) => {
      setLoading(isLoading);
    });

    return () => {
      ipcRenderer.removeAllListeners("loading");
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (window.localStorage.getItem("musicvol")) {
        audioRef.current.volume = Number(
          window.localStorage.getItem("musicvol")
        );
      } else {
        audioRef.current.volume = 0.5;
      }
    }
  }, [settings]);

  useEffect(() => {
    if (!audioRef.current || !audioContainerRef.current) return;

    const audioMotion = new AudioMotionAnalyzer(audioContainerRef.current, {
      source: audioRef.current,
      height: 260,
      overlay: true,
      showBgColor: true,
      bgAlpha: 0,
      showScaleX: false,
      showScaleY: false,
      ansiBands: false,
      mode: 2,
      frequencyScale: "log",
      showPeaks: false,
      smoothing: 0.6,
      gradient: "prism",
    });

    audioMotionRef.current = audioMotion;

    return () => {
      audioMotion.disconnectInput();
      audioMotion.destroy();
    };
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      if (audioRef.current && !pauseSong) {
        // Check if pauseSong is false
        audioRef.current.play(); // Auto-play the new song
      }
    } else {
      hasMounted.current = true;
    }
  }, [song, pauseSong]); // Also listen to pauseSong changes

  useEffect(() => {
    fetch("/music/songs.json")
      .then((response) => response.json())
      .then((data) => {
        const songData = data.map((song) => song);
        setSongs(songData);
      })
      .catch((error) => console.error("Error loading songs:", error));
  }, []);

  useEffect(() => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentIndex(randomIndex);
      setSong(songs[randomIndex]);
    }
  }, [songs]);

  useEffect(() => {
    const handleEnd = () => {
      const nextIndex = (currentIndex + 1) % songs.length; // Cycle through songs
      setCurrentIndex(nextIndex);
      setSong(songs[nextIndex]);
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("ended", handleEnd);
      return () => {
        audioElement.removeEventListener("ended", handleEnd);
      };
    }
  }, [currentIndex, songs]);

  const changeSong = (index) => {
    if (index >= 0 && index < songs.length) {
      setCurrentIndex(index);
      setSong(songs[index]);
    }
  };

  const handlePreviousSong = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    changeSong(newIndex);
  };

  const handleNextSong = () => {
    const newIndex = Math.min(songs.length - 1, currentIndex + 1);
    changeSong(newIndex);
  };

  const handlePause = () => {
    setPauseSong(!pauseSong);
    window.localStorage.setItem("pause", pauseSong ? false : true);
  };

  function preventDragHandler(e) {
    e.preventDefault();
  }

  function handleMouseOver() {
    setIsCarouselEnabled(false);
  }

  function handleMouseLeave() {
    setIsCarouselEnabled(true);
  }

  return (
    <>
      <div className="audioDrag" ref={audioDragRef}></div>

      <audio
        className="audio"
        src={song ? song.path : null}
        controls
        crossOrigin="anonymous"
        ref={audioRef}
        // Removed the loop attribute to avoid looping behavior
      />

      <div id="audioContainer" ref={audioContainerRef}></div>

      {song && song.bpm && !loading ? (
        <div
          className="beat"
          style={pauseSong ? { opacity: "0" } : { opacity: "1" }}
        >
          <div
            key={song ? song.name : "no-song"}
            style={{
              animationPlayState: pauseSong ? "paused" : "running",
              animationDuration: song
                ? `${60000 / (song.bpm >= 120 ? song.bpm / 2 : song.bpm)}ms`
                : undefined,
            }}
          ></div>
        </div>
      ) : null}

      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 1 }}
        drag
        dragConstraints={audioDragRef}
        className="songControls"
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        {song ? (
          <img
            src={song.coverArt}
            alt="Cover Art"
            onDragStart={preventDragHandler}
          />
        ) : null}

        <div className="songContent">
          <div className="songInfo">
            <div>
              {song ? (
                <>
                  <h2>{song ? song.name : null}</h2>
                  <p>{song ? song.author : null}</p>
                </>
              ) : (
                <BarLoader
                  color="#ffffff"
                  loading={true}
                  size={150}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                  className="audioLoading"
                />
              )}
            </div>
          </div>
          <span
            className="dragBar"
            style={
              !pauseSong
                ? {
                    background:
                      "linear-gradient(-90deg, #12c2e9, #c471ed, #f64f59)",
                    backgroundSize: "400% 400%",
                    animation: "gradient 5s ease infinite",
                  }
                : {}
            }
          ></span>
          <div className="songButtons">
            <img
              onClick={handlePreviousSong}
              src={"/assets/svg/backwards.svg"}
              alt="Previous Song"
              onDragStart={preventDragHandler}
            />
            <img
              onClick={handlePause}
              src={pauseSong ? "/assets/svg/play.svg" : "/assets/svg/pause.svg"}
              alt="Pause Song"
              onDragStart={preventDragHandler}
            />
            <img
              onClick={handleNextSong}
              src={"/assets/svg/forwards.svg"}
              alt="Next Song"
              onDragStart={preventDragHandler}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AudioProvider;
