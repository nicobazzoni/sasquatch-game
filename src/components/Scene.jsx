import React, { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import Enemy from "./Enemy";
import Particle from "./Particle";
import Weapon from "./Weapon";
import Floor from "./Floor";

const Scene = () => {
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const { camera } = useThree(); // Access the Three.js camera
  const playerRef = useRef(); // Reference for the player "body"
  const maxEnemies = 5; // Maximum number of enemies at once

  // Track key presses for movement
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  // Event listeners for keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.current[e.key.toLowerCase()] !== undefined) {
        keys.current[e.key.toLowerCase()] = true;
      }
    };

    const handleKeyUp = (e) => {
      if (keys.current[e.key.toLowerCase()] !== undefined) {
        keys.current[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Spawn new enemies periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies((prev) => {
        const visibleEnemies = prev.filter((e) => e.visible).length;
        if (visibleEnemies >= maxEnemies) return prev; // Respect max limit
        return [
          ...prev,
          {
            id: uuidv4(), // Generate a unique ID for each enemy
            position: [
              Math.random() * 20 - 10,
              0.5,
              Math.random() * 20 - 10,
            ],
            visible: true,
            boundingBox: null,
          },
        ];
      });
    }, 2000); // Spawn new enemy every 2 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  // Handle collision when a particle hits an enemy
  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies((prev) => [
        ...prev,
        {
          id: uuidv4(),
          position: [
            Math.random() * 20 - 10,
            0.5,
            Math.random() * 20 - 10,
          ],
          visible: true,
          boundingBox: null,
        },
      ]);
    }, 3000); // Add a new enemy every 5 seconds for testing
  
    return () => clearInterval(interval);
  }, []);

  // Update player position and link camera to player
  useFrame(() => {
    if (!playerRef.current) return;

    const speed = 0.1; // Movement speed
    const direction = new THREE.Vector3();

    // Calculate movement direction
    if (keys.current.w) direction.z -= speed;
    if (keys.current.s) direction.z += speed;
    if (keys.current.a) direction.x -= speed;
    if (keys.current.d) direction.x += speed;

    // Update player position
    playerRef.current.position.add(direction);

    // Attach the camera to the player's position
    camera.position.set(
      playerRef.current.position.x,
      playerRef.current.position.y + 1.6, // Adjust camera height
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
          // onCollision={handleCollision}
          onRemove={() =>
            setParticles((prev) => prev.filter((p) => p.id !== particle.id))
          }
        />
      ))}
    </>
  );
};

export default Scene;