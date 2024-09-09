import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Emulators from "./Emulators";
import Home from "./Home";
import EmulatorRoms from "./EmulatorRoms";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="emulators" element={<Emulators />} />
        <Route path="emulators/:emulatorName" element={<EmulatorRoms />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
