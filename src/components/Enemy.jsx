import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Enemy = ({ id, position, setBoundingBox, playerPosition, onHit, onPlayerHit }) => {
  const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/bigfootw%3Ajumpanddie.glb");
  const ref = useRef();
  const mixer = useRef(null);
  const boundingBox = useRef(new THREE.Box3());
  const actions = useRef({});
  const hitCount = useRef(0);
  const isDead = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const respawnPosition = useRef(position.slice());
  const attackCooldown = useRef(false);

  useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);

      animations.forEach((clip) => {
        actions.current[clip.name] = mixer.current
          .clipAction(clip, ref.current)
          .setEffectiveWeight(1);
      });

      console.log("Available animations:", Object.keys(actions.current));
      resetState();
    }
  }, [animations, scene]);

  const resetState = () => {
    hitCount.current = 0;
    isDead.current = false;
    velocity.current.set(0, 0, 0);

    if (ref.current) {
      ref.current.position.set(...respawnPosition.current);
    }

    Object.values(actions.current).forEach((action) => {
      action.stop();
      action.reset();
    });

    if (actions.current["run"]) {
      actions.current["run"].play();
      velocity.current.set(0, 0, 5);
    }
  };
  const handleHit = () => {
    if (isDead.current) return;
  
    hitCount.current += 1;
    console.log(`Hit Count: ${hitCount.current}`);
  
    if (hitCount.current === 1) {
      console.log("Bigfoot starts walking!");
      playAnimation("run");
      velocity.current.set(0, 0, 5); // Walking speed
   // Running speed
    } else if (hitCount.current >= 3) {
      console.log("Bigfoot dies!");
      isDead.current = true;
  
      Object.values(actions.current).forEach((action) => action.stop());
      if (actions.current["die"]) {
        const dieAction = actions.current["die"];
        dieAction.reset();
        dieAction.setLoop(THREE.LoopOnce, 1);
        dieAction.clampWhenFinished = true;
        dieAction.play();
  
        mixer.current.addEventListener("finished", (event) => {
          if (event.action === dieAction) {
            console.log("Bigfoot's death animation finished.");
            resetState();
          }
        });
      }
  
      if (onHit) onHit(id);
    }
  };


  const moveTowardPlayer = (delta) => {
    if (!playerPosition) return;

    const playerPos = new THREE.Vector3(...playerPosition);
    const direction = playerPos.clone().sub(ref.current.position).normalize();
    const speed = 2;

    velocity.current.copy(direction.multiplyScalar(speed));
  };

  const playAnimation = (animationName) => {
    if (actions.current[animationName]) {
      Object.values(actions.current).forEach((action) => {
        if (action !== actions.current[animationName]) {
          action.fadeOut(0.2);
        }
      });

      const action = actions.current[animationName];
      if (!action.isRunning()) {
        action.reset().fadeIn(0.2).play();
      }
    } else {
      console.warn(`Animation ${animationName} not found.`);
    }
  };

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);
  
    if (isDead.current || !ref.current) return;
  
    // Random direction change every 2 seconds
    const time = performance.now() / 1000; // Current time in seconds
    const changeInterval = 2; // Interval to change direction
  
    if (Math.floor(time) % changeInterval === 0 && !velocity.current.isChanging) {
      velocity.current.isChanging = true;
  
      // Generate a new random direction
      const randomAngle = Math.random() * Math.PI * 2; // Random angle in radians
      velocity.current.set(
        Math.cos(randomAngle) * 2, // X component
        0,
        Math.sin(randomAngle) * 2 // Z component
      );
  
      // Reset flag after a short delay
      setTimeout(() => {
        velocity.current.isChanging = false;
      }, 200);
    }
  
    // Keep speed consistent
    velocity.current.setLength(2); // Ensure velocity magnitude remains constant
  
    // Apply movement
    const moveVector = velocity.current.clone().multiplyScalar(delta);
    ref.current.position.add(moveVector);
  
    // Align Bigfoot's rotation with his movement direction
    if (velocity.current.length() > 0) {
      const targetDirection = velocity.current.clone().normalize(); // Get movement direction
      const angle = Math.atan2(targetDirection.x, targetDirection.z); // Calculate rotation angle
      ref.current.rotation.y = angle; // Rotate Bigfoot to face the movement direction
    }
  
    // Keep Bigfoot within boundaries and redirect smoothly
    const minX = -50, maxX = 50;
    const minZ = -50, maxZ = 50;
  
    if (ref.current.position.x < minX) {
      ref.current.position.x = minX;
      velocity.current.x = Math.abs(velocity.current.x); // Redirect smoothly
    }
    if (ref.current.position.x > maxX) {
      ref.current.position.x = maxX;
      velocity.current.x = -Math.abs(velocity.current.x); // Redirect smoothly
    }
    if (ref.current.position.z < minZ) {
      ref.current.position.z = minZ;
      velocity.current.z = Math.abs(velocity.current.z); // Redirect smoothly
    }
    if (ref.current.position.z > maxZ) {
      ref.current.position.z = maxZ;
      velocity.current.z = -Math.abs(velocity.current.z); // Redirect smoothly
    }
  
    if (ref.current) {
      boundingBox.current.setFromObject(ref.current);
      if (setBoundingBox) setBoundingBox(boundingBox.current);
    }
  });
  return (
    <primitive
      ref={ref}
      object={scene}
      scale={[4, 4, 4]}
      onPointerDown={handleHit}
    />
  );
};

export default Enemy;