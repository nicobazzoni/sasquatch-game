import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Scene from "./components/Scene";
import Floor from "./components/Floor";
import useSound from "./components/useSound";
import { GameProvider } from "./GameContext";
const App = () => {
  const [gameStarted, setGameStarted] = useState(false); // Track user interaction
  const [playerHealth, setPlayerHealth] = useState(100);
  const [ammo, setAmmo] = useState(9);
  const [kills, setKills] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [deathCount, setDeathCount] = useState(0);

  const handleEnemyDeath = () => {
    setKills((prev) => {
      console.log("Kill registered! Previous kills:", prev);
      return prev + 1;
    });
  };
  const handlePlayerHit = () => setPlayerHealth((prev) => Math.max(prev - 20, 0));
  const handleAmmoUsage = () => setAmmo((prev) => (prev > 0 ? prev - 1 : 0));
  
  const handleEnemyHit = () => {
    setEnemyHealth((prev) => {
      const newHealth = Math.max(prev - 40, 0);
      if (newHealth <= 0) {
        setKills((prevKills) => prevKills + 1);
        return 100;
      }
      return newHealth;
    });
  };

  

  const resetGame = () => {
    setPlayerHealth(100);
    setAmmo(9);
    setKills(0);
    setEnemyHealth(100);
  };

  const playBackgroundMusic = useSound(
    "https://storage.googleapis.com/new-music/Synths_Loops_5_DarkCorridorsFullMix82_Am.wav"
  );

  const playEnvironmentSound = useSound(
  "https://storage.googleapis.com/new-music/winter_forest.glb"
  )
  // Start music after game starts);
  const startGame = () => {
    setGameStarted(true);
    playBackgroundMusic();
   
  };

  useEffect(() => {
    playEnvironmentSound(); // Play sound on game start
  }, [playEnvironmentSound]);


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!gameStarted && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <button
            onClick={startGame}
            style={{
              padding: "20px 40px",
              fontSize: "24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Start Game
          </button>
        </div>
      )}

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
      <GameProvider>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} />
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
          handleEnemyDeath={handleEnemyDeath}
        />
        <Floor />
        <PointerLockControls />

      </Canvas>
      </GameProvider>
    </div>
  );
};

export default App;