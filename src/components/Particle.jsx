import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useSound from "./useSound"; // Import sound hook for scream sound

const Particle = ({ start, direction, enemies, onCollision, onRemove }) => {
  const ref = useRef();
  const maxDistance = 50;

  // Load the scream sound for the enemy death
  const playGruntSound = useSound("https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3");

  useFrame(() => {
    if (!ref.current) {

      return;
    }
  
    // Move the particle
    const normalizedDirection = direction.clone().normalize();
    ref.current.position.add(normalizedDirection.multiplyScalar(0.5)); // Adjust speed here
  
  
    // Check for collisions
    enemies.forEach((enemy) => {
      if (!enemy.boundingBox) {
     
        return;
      }
  
      const enemyCenter = enemy.boundingBox.getCenter(new THREE.Vector3());
      const distance = ref.current.position.distanceTo(enemyCenter);
   
  
      if (distance < 1) { // Adjust threshold for easier hits
        console.log(`Hit Enemy ID: ${enemy.id}`);
        playGruntSound();
        onCollision(enemy.id);
        onRemove();
      }
    });
  });
  
  return (
    <mesh ref={ref} position={start}>
      {/* Use a small sphere to visualize the particle */}
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

export default Particle;