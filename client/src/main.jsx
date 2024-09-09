import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

const appContainer = document.getElementById("root");

function scaleApp() {
  const baseWidth = 1400;
  const baseHeight = 787.5; // 16:9 aspect ratio corresponding height
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;

  // Calculate the scale factor based on width, maintaining aspect ratio
  const scaleWidth = currentWidth < baseWidth ? currentWidth / baseWidth : 1;
  const scaleHeight =
    currentHeight < baseHeight ? currentHeight / baseHeight : 1;

  // Use the smaller scale factor to maintain the 16:9 aspect ratio
  const scale = Math.min(scaleWidth, scaleHeight);

  // Apply the scale to the app container
  appContainer.style.transform = `scale(${scale})`;

  // Adjust the container size to prevent overflow issues
  appContainer.style.width = `${100 / scale}%`;
  appContainer.style.height = `${100 / scale}%`;
}

// Initial scaling when the app loads
scaleApp();

// Recalculate the scale on window resize
window.addEventListener("resize", scaleApp);
