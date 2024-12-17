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
  const [particles, setParticles] = useState([]); // Local state for bullets
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

  // Handle player movement and camera attachment
  useFrame(() => {
    if (!playerRef.current) return;

    const speed = 0.1; // Movement speed
    const direction = new THREE.Vector3();

    // Update direction based on key presses
    if (keys.current.w) direction.z -= speed;
    if (keys.current.s) direction.z += speed;
    if (keys.current.a) direction.x -= speed;
    if (keys.current.d) direction.x += speed;

    // Update player position
    playerRef.current.position.add(direction);

    // Attach camera to the player position
    camera.position.set(
      playerRef.current.position.x,
      playerRef.current.position.y + 1.6, // Adjust camera height
      playerRef.current.position.z
    );
  });

  // Handle collision when a particle hits an enemy
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
    handleEnemyHit(); // Notify parent about the hit
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
            onHit={handleEnemyDeath}
          />
        ) : null
      )}

      {/* Weapon */}
      <Weapon
        onFire={(start, direction) => {
          // Add new bullet to particles state
          setParticles((prev) => [
            ...prev,
            { id: uuidv4(), start, direction },
          ]);
          handleAmmoUsage(); // Notify parent about ammo usage
        }}
      />

      {/* Render Particles */}
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          start={particle.start}
          direction={particle.direction}
          enemies={enemies}
          onCollision={handleCollision} // Notify parent on collision
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