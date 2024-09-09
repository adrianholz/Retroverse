import React, { createContext, useCallback, useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");
import {
  buildAuthorization,
  getUserSummary,
  getUserRecentlyPlayedGames,
  getUserAwards,
  getAchievementsEarnedBetween,
} from "@retroachievements/api";

export const UserContext = createContext();

export const UserStorage = ({ children }) => {
  const [language, setLanguage] = useState("en-us");
  const [data, setData] = useState(null);
  const [recentGames, setRecentGames] = useState(null);
  const [awards, setAwards] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [login, setLogin] = useState(null);
  const [authorization, setAuthorization] = useState(null);
  const [loading, setLoading] = useState(null);
  const [player, setPlayer] = useState(
    window.localStorage.getItem("player")
      ? window.localStorage.getItem("player") == "true"
        ? false
        : true
      : true
  );
  const [pauseSong, setPauseSong] = useState(
    window.localStorage.getItem("pause")
      ? window.localStorage.getItem("pause") == "true"
        ? true
        : false
      : false
  );
  const [settings, setSettings] = useState(false);
  const [search, setSearch] = useState(false);
  const [skraper, setSkraper] = useState(false);
  const [musicVolume, setMusicVolume] = useState(
    window.localStorage.getItem("musicvol")
      ? window.localStorage.getItem("musicvol")
      : 0.5
  );
  const [sfxVolume, setSfxVolume] = useState(
    window.localStorage.getItem("sfxvol")
      ? window.localStorage.getItem("sfxvol")
      : 0.5
  );
  const [isCarouselEnabled, setIsCarouselEnabled] = useState(true);
  const [emulatorData, setEmulatorData] = useState({});

  function changeLanguage(language) {
    setLanguage(language);
  }

  function changePlayer() {
    setPlayer(!player);
  }

  function changeSettings() {
    setSettings(!settings);
  }

  function handleScrape() {
    ipcRenderer.send("run-skraper");
    setSkraper(true);
  }

  useEffect(() => {
    ipcRenderer.on("skraper-closed", (event, code) => {
      console.log(`Skraper process closed with code ${code}`);
      setSkraper(false);
    });

    return () => {
      ipcRenderer.removeAllListeners("skraper-closed");
    };
  }, []);

  const username = import.meta.env.VITE_USERNAME;
  const webApiKey = import.meta.env.VITE_WEB_API_KEY;

  const auth = buildAuthorization({
    username,
    webApiKey,
  });

  useEffect(() => {
    fetch("/roms/emulators.json")
      .then((response) => response.json())
      .then((data) => setEmulatorData(data))
      .catch((error) => console.error("Error fetching emulator data:", error));
  }, []);

  useEffect(() => {
    setAuthorization(auth);
  }, [username, webApiKey]);

  const userLogout = useCallback(async function () {
    setData(null);
    setLoading(false);
    setLogin(false);
    setRecentGames(null);
    setAwards(null);
    setAchievements(null);
    window.localStorage.removeItem("username");
  }, []);

  async function userLogin(username) {
    try {
      setLoading(true);
      const userSummary = await getUserSummary(auth, { username });
      setData(userSummary);
      window.localStorage.setItem("username", username);
      setLogin(true);
      await fetchRecentGames(username);
      await fetchAwards(username);
      await fetchRecentAchievements(username);
    } catch (error) {
      console.error("Retrieve failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentGames(username) {
    try {
      const userRecentlyPlayedGames = await getUserRecentlyPlayedGames(auth, {
        username: username,
        count: 10,
      });
      setRecentGames(userRecentlyPlayedGames);
    } catch (error) {
      console.error("Retrieve recent games failed:", error);
    }
  }

  async function fetchAwards(username) {
    try {
      const userAwards = await getUserAwards(auth, {
        username: username,
      });
      setAwards(userAwards);
    } catch (error) {
      console.error("Retrieve awards failed:", error);
    }
  }

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 1);

  async function fetchRecentAchievements(username) {
    try {
      const userAchievements = await getAchievementsEarnedBetween(auth, {
        username: username,
        fromDate: fromDate,
        toDate: toDate,
      });
      setAchievements(userAchievements);
    } catch (error) {
      console.error("Retrieve achievements failed:", error);
    }
  }

  useEffect(() => {
    async function autoLogin() {
      const username = window.localStorage.getItem("username");
      if (username) {
        try {
          setLoading(true);
          const userProfile = await getUserSummary(auth, {
            username: username,
          });
          setData(userProfile);
          setLogin(true);
          await fetchRecentGames(username);
          await fetchAwards(username);
          await fetchRecentAchievements(username);
        } catch (error) {
          console.error("Retrieve failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLogin(false);
      }
    }
    autoLogin();
  }, [userLogout]);

  return (
    <UserContext.Provider
      value={{
        language,
        changeLanguage,
        userLogin,
        data,
        recentGames,
        awards,
        achievements,
        loading,
        login,
        userLogout,
        fetchRecentGames,
        fetchAwards,
        fetchRecentAchievements,
        player,
        changePlayer,
        changeSettings,
        settings,
        musicVolume,
        setMusicVolume,
        sfxVolume,
        setSfxVolume,
        isCarouselEnabled,
        setIsCarouselEnabled,
        emulatorData,
        pauseSong,
        setPauseSong,
        search,
        setSearch,
        skraper,
        setSkraper,
        handleScrape,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
