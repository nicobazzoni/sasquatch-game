import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Enemy from "./Enemy";
import Particle from "./Particle";
import Weapon from "./Weapon";
import Floor from "./Floor";
import { v4 as uuidv4 } from "uuid";

const Scene = ({
  handlePlayerHit, // Callback for player health
  handleEnemyHit, // Callback for enemy hit logic
  handleEnemyDeath, // Callback for enemy death and kills
  handleAmmoUsage, // Callback for ammo usage
  playerPosition, // Player position passed from parent
  ...props // Additional props for enemies and collisions
}) => {
  const [enemies, setEnemies] = useState([]);
  const [deathCount, setDeathCount] = useState(0); // Track death count
  const [particles, setParticles] = useState([]); // Bullets
  const { camera } = useThree();
  const playerRef = useRef();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const maxEnemies = 5;

  const [floorBoundary, setFloorBoundary] = useState({
    minX: -50,
    maxX: 50,
    minZ: -50,
    maxZ: 50,
  });

  // Handle enemy death


  // Initialize enemies
  useEffect(() => {
    const initialEnemies = Array.from({ length: maxEnemies }).map(() => ({
      id: uuidv4(),
      position: [Math.random() * 20 - 10, 0.5, Math.random() * 20 - 10],
      visible: true,
      boundingBox: null,
    }));
    setEnemies(initialEnemies);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (keys.current[key] !== undefined) {
        keys.current[key] = true;
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (keys.current[key] !== undefined) {
        keys.current[key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle player movement
  useFrame(() => {
    if (!playerRef.current) return;

    const speed = 0.1;
    const direction = new THREE.Vector3();

    if (keys.current.w) direction.z -= speed;
    if (keys.current.s) direction.z += speed;
    if (keys.current.a) direction.x -= speed;
    if (keys.current.d) direction.x += speed;

    playerRef.current.position.add(direction);

    camera.position.set(
      playerRef.current.position.x,
      playerRef.current.position.y + 1.6,
      playerRef.current.position.z
    );
  });

  // Handle collision when a bullet hits an enemy
  const handleCollision = (enemyId) => {
    setEnemies((prev) =>
      prev.map((enemy) =>
        enemy.id === enemyId
          ? {
              ...enemy,
              position: [
                Math.random() * 20 - 10,
                0.5,
                Math.random() * 20 - 10,
              ],
              visible: true,
            }
          : enemy
      )
    );
    handleEnemyHit();
  };

  return (
    <>
      {/* Player */}
      <mesh ref={playerRef} position={[0, 0.5, 0]} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Floor */}
      <Floor setFloorBoundary={setFloorBoundary} />

      {/* Render Enemies */}
      {enemies.map((enemy) =>
        enemy.visible ? (
          <Enemy
            key={enemy.id}
            id={enemy.id}
            boundary={floorBoundary}
            position={enemy.position}
            setBoundingBox={(boundingBox) =>
              setEnemies((prev) =>
                prev.map((e) =>
                  e.id === enemy.id ? { ...e, boundingBox } : e
                )
              )
            }
            playerPosition={playerRef.current?.position.toArray() || [0, 0, 0]}
            onPlayerHit={handlePlayerHit}
            onDeath={() => {
              handleEnemyDeath(); // Increment death count in App
            }}
          />
        ) : null
      )}

      {/* Weapon */}
      <Weapon
        onFire={(start, direction) => {
          setParticles((prev) => [
            ...prev,
            { id: uuidv4(), start, direction },
          ]);
          handleAmmoUsage();
        }}
      />

      {/* Render Bullets */}
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          start={particle.start}
          direction={particle.direction}
          enemies={enemies}
          onCollision={handleCollision}
          onRemove={() =>
            setParticles((prev) =>
              prev.filter((p) => p.id !== particle.id)
            )
          }
        />
      ))}
    </>
  );
};

export default Scene;