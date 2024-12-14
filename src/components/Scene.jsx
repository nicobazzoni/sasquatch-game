import React, { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Enemy from "./Enemy";
import Particle from "./Particle";
import Weapon from "./Weapon";
import Floor from "./Floor";
import { v4 as uuidv4 } from "uuid";

const Scene = () => {
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const { camera } = useThree();
  const playerRef = useRef();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const maxEnemies = 1; // Reduced to 1 for debugging

  // Get player position
  const playerPosition = playerRef.current
    ? playerRef.current.position.toArray()
    : [0, 0, 0];

  // Log for debugging "double Bigfoot"
 

  // Handle player being hit
  const handlePlayerHit = (enemyId) => {
    console.log(`Player hit by enemy with ID: ${enemyId}`);
    // Add logic here (e.g., reduce player health)
  };

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

  // Add event listeners for keyboard input
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
  };

  // Update player position and link camera to player
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

  return (
    <>
      {/* Invisible player body */}
      <mesh ref={playerRef} position={[0, 0.5, 0]} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Floor */}
      <Floor />

      {/* Render Enemies */}
      {enemies.map((enemy) =>
        enemy.visible ? (
          <Enemy
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
            setBoundingBox={(boundingBox) =>
              setEnemies((prev) =>
                prev.map((e) =>
                  e.id === enemy.id ? { ...e, boundingBox } : e
                )
              )
            }
            playerPosition={playerPosition}
            onPlayerHit={handlePlayerHit}
          />
        ) : null
      )}

      {/* Render Weapon */}
      <Weapon
        onFire={(start, direction) =>
          setParticles((prev) => [
            ...prev,
            { id: uuidv4(), start, direction },
          ])
        }
      />

      {/* Render Particles */}
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          start={particle.start}
          direction={particle.direction}
          enemies={enemies}
          onCollision={handleCollision}
          onRemove={() =>
            setParticles((prev) => prev.filter((p) => p.id !== particle.id))
          }
        />
      ))}
    </>
  );
};

export default Scene;