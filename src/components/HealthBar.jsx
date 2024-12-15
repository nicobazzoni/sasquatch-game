import React from "react";
import { Html } from "@react-three/drei";

const HealthBar = ({ position, health, maxHealth, color = "green" }) => {
  const width = 100; // Width of the health bar in pixels
  const healthPercentage = (health / maxHealth) * width;

  return (
    <Html position={position} distanceFactor={10} style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "relative",
          width: `${width}px`,
          height: "10px",
          backgroundColor: "gray",
          border: "1px solid black",
        }}
      >
        <div
          style={{
            width: `${healthPercentage}px`,
            height: "100%",
            backgroundColor: color,
          }}
        ></div>
      </div>
    </Html>
  );
};

export default HealthBar;