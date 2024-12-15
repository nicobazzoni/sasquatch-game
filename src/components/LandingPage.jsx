import React from "react";
import { Html } from "@react-three/drei";

const LandingPage = ({ visible, onRestart }) => {
  if (!visible) return null;

  return (
    <Html fullscreen>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black background
          color: "white",
        }}
      >
        <h1 style={{ fontSize: "48px", margin: "20px 0" }}>Sasquatch Game</h1>
        <p style={{ fontSize: "24px", margin: "10px 0" }}>Game Over</p>
        <button
          onClick={onRestart}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            color: "white",
            backgroundColor: "red",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Restart Game
        </button>
      </div>
    </Html>
  );
};

export default LandingPage;