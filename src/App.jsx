import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Scene from "./components/Scene";
import Floor from "./components/Floor";

const App = () => {
  // Game state
  const [playerHealth, setPlayerHealth] = useState(100);
  const [ammo, setAmmo] = useState(9);
  const [kills, setKills] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(100);

  // Handle player getting hit
  const handlePlayerHit = () => {
    setPlayerHealth((prev) => Math.max(prev - 20, 0)); // Reduce health by 20
  };

  // Handle ammo usage
  const handleAmmoUsage = () => {
    setAmmo((prev) => (prev > 0 ? prev - 1 : 0)); // Decrease ammo by 1
  };

  // Unified enemy hit and death handler
  const handleEnemyHit = () => {
    setEnemyHealth((prev) => {
      const newHealth = Math.max(prev - 40, 0); // Reduce enemy health by 40
      if (newHealth <= 0) {
        console.log("Enemy defeated!");
        setKills((prevKills) => prevKills + 1); // Increment kill count
        return 100; // Reset enemy health for the next enemy
      }
      return newHealth;
    });
  };

  // Reset game state
  const resetGame = () => {
    setPlayerHealth(100);
    setAmmo(9);
    setKills(0);
    setEnemyHealth(100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Stats Section */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#222",
          color: "white",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <div>Player Health: {playerHealth}</div>
        <div>Enemy Health: {enemyHealth}</div>
        <div>Ammo: {ammo}</div>
        <div>Kills: {kills}</div>
        <button
          onClick={resetGame}
          style={{
            padding: "5px 10px",
            fontSize: "14px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reset Game
        </button>
      </div>

      {/* Game Canvas */}
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} />

        {/* Game Scene */}
        <Scene
          playerHealth={playerHealth}
          setPlayerHealth={setPlayerHealth}
          ammo={ammo}
          setAmmo={setAmmo}
          kills={kills}
          setKills={setKills}
          enemyHealth={enemyHealth}
          setEnemyHealth={setEnemyHealth}
          handlePlayerHit={handlePlayerHit}
          handleAmmoUsage={handleAmmoUsage}
          handleEnemyHit={handleEnemyHit}
        />
        <Floor />
        <PointerLockControls />
      </Canvas>
    </div>
  );
};

export default App;