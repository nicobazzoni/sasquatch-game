import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [kills, setKills] = useState(0);
  const [ammo, setAmmo] = useState(9);
  const [playerHealth, setPlayerHealth] = useState(100);

  const handleEnemyDeath = () => setKills((prev) => prev + 1);
  const handleAmmoUsage = () => setAmmo((prev) => Math.max(prev - 1, 0));
  const handlePlayerHit = () => setPlayerHealth((prev) => Math.max(prev - 20, 0));

  return (
    <GameContext.Provider
      value={{
        kills,
        ammo,
        playerHealth,
        handleEnemyDeath,
        handleAmmoUsage,
        handlePlayerHit,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);