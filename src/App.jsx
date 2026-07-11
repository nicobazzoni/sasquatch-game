import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Scene from "./components/Scene";
import useSound from "./components/useSound";
import "./App.css";

const App = () => {
  const pointerLockControlsRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameVersion, setGameVersion] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [ammo, setAmmo] = useState(9);
  const [kills, setKills] = useState(0);
  const [slashFlash, setSlashFlash] = useState(0);
  const [shotFlash, setShotFlash] = useState(0);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const gameOver = playerHealth <= 0;
  const threatLevel = kills >= 10 ? "HUNTED" : kills >= 6 ? "SEVERE" : kills >= 3 ? "HIGH" : "LOW";

  useEffect(() => {
    if (gameOver) {
      pointerLockControlsRef.current?.unlock();
    }
  }, [gameOver]);

  useEffect(() => {
    if (!gameOver) {
      setShowGameOver(false);
      return undefined;
    }

    const gameOverTimeout = window.setTimeout(() => {
      setShowGameOver(true);
    }, 850);

    return () => window.clearTimeout(gameOverTimeout);
  }, [gameOver]);

  const handleEnemyDeath = () => {
    setKills((prev) => prev + 1);
  };

  const handlePlayerHit = (damage = 100) => {
    setSlashFlash((prev) => prev + 1);
    setPlayerHealth((prev) => Math.max(prev - damage, 0));
  };

  const handleAmmoUsage = () => {
    if (gameOver) return;
    setAmmo((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleReloadComplete = () => {
    if (gameOver) return;
    setAmmo(9);
  };

  const resetGame = () => {
    setPlayerHealth(100);
    setAmmo(9);
    setKills(0);
    setShowGameOver(false);
    setIsPointerLocked(false);
    setIsReloading(false);
    setGameStarted(true);
    setGameVersion((prev) => prev + 1);
  };

  const playBackgroundMusic = useSound(
    "https://storage.googleapis.com/new-music/Synths_Loops_5_DarkCorridorsFullMix82_Am.wav",
    true,
    0.35,
  );

  const startGame = () => {
    setGameStarted(true);
    setGameVersion((prev) => prev + 1);
    playBackgroundMusic();
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
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

      {showGameOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "24px",
            backgroundColor: "rgba(0, 0, 0, 0.78)",
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "64px", fontWeight: 900, color: "#ff3333" }}>
            GAME OVER
          </div>
          <div style={{ fontSize: "22px" }}>Bigfoot got you.</div>
          <button
            onClick={resetGame}
            style={{
              padding: "16px 32px",
              fontSize: "22px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>
      )}

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
        <div>Ammo: {ammo}</div>
        <div>{isReloading ? "Reloading..." : "R to Reload"}</div>
        <div>Kills: {kills}</div>
        <div>Threat: {threatLevel}</div>
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

      <Canvas id="game-canvas" camera={{ position: [0, 2, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} />
        <Scene
          key={gameVersion}
          gameOver={gameOver}
          handlePlayerHit={handlePlayerHit}
          handleAmmoUsage={handleAmmoUsage}
          handleEnemyDeath={handleEnemyDeath}
          handleReloadComplete={handleReloadComplete}
          inputEnabled={isPointerLocked && !gameOver}
          onReloadStateChange={setIsReloading}
          onWeaponFire={() => setShotFlash((prev) => prev + 1)}
          kills={kills}
        />
        <PointerLockControls
          ref={pointerLockControlsRef}
          enabled={!gameOver}
          selector="#game-canvas"
          onLock={() => setIsPointerLocked(true)}
          onUnlock={() => setIsPointerLocked(false)}
        />
      </Canvas>

      {gameStarted && !gameOver && (
        <>
          <div className={`crosshair ${isReloading ? "crosshair--reloading" : ""}`}>
            <span />
            <span />
          </div>
          {!isPointerLocked && (
            <div className="aim-prompt">Click the game to aim</div>
          )}
        </>
      )}

      {shotFlash > 0 && (
        <div key={shotFlash} className="muzzle-flash" aria-hidden="true" />
      )}

      {slashFlash > 0 && (
        <div key={slashFlash} className="slash-overlay" aria-hidden="true" />
      )}
    </div>
  );
};

export default App;
