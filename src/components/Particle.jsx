import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useSound from "./useSound";

const Particle = ({ start, direction, enemies, onCollision, onRemove }) => {
  const ref = useRef();
  const maxDistance = 50;

  // Load the scream sound for the enemy death
  const playAttackScream = useSound(
    "https://storage.googleapis.com/new-music/monster-roar-02-102957%20(1).mp3",
    0.8
  );

  useFrame(() => {
    if (!ref.current) return;

    // Move the particle
    const normalizedDirection = direction.clone().normalize();
    ref.current.position.add(normalizedDirection.multiplyScalar(0.5)); // Adjust speed here

    // Check for collisions
    enemies.forEach((enemy) => {
      if (!enemy.boundingBox) return;

      const enemyCenter = enemy.boundingBox.getCenter(new THREE.Vector3());
      const distance = ref.current.position.distanceTo(enemyCenter);

      if (distance < 1) {
        console.log(`Hit Enemy ID: ${enemy.id}`);

        // Trigger scream sound only once per collision
        if (!enemy.isHit) {
          enemy.isHit = true; // Mark enemy as hit
          playAttackScream();
        }

        // Trigger the 'die' animation for the enemy
        if (enemy.mixer && enemy.animations.die) {
          const dieAction = enemy.mixer.clipAction(enemy.animations.die);
          dieAction.reset().play();
        }

        // Notify collision and remove particle
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