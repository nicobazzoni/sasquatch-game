import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useSound from "./useSound";

const Enemy = ({ id, position, setBoundingBox, playerPosition, onHit = () => {}, onPlayerHit = () => {} }) => {
  const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/bigfootw%3Ajumpanddie.glb");
  const ref = useRef();
  const mixer = useRef(null);
  const boundingBox = useRef(new THREE.Box3());
  const actions = useRef({});
  const hitCount = useRef(0);
  const isDead = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 5)); // Start with default velocity
  const respawnPosition = useRef(position.slice());
  const attackCooldown = useRef(false);
  const randomTarget = useRef(new THREE.Vector3());
  const randomTargetTimer = useRef(0);

  const grunt = useSound("https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3");
  const playAttackScream = useSound("https://storage.googleapis.com/new-music/monster-roar-02-102957%20(1).mp3")
  
  
   useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);

      animations
        .filter((clip) => clip.name.toLowerCase() !== "tpose")
        .forEach((clip) => {
          actions.current[clip.name] = mixer.current.clipAction(clip, ref.current).setEffectiveWeight(1);
        });

      console.log("Available animations:", Object.keys(actions.current));
      resetState();
    }

    return () => {
      if (mixer.current) mixer.current.stopAllAction();
    };
  }, [animations, scene]);

  const generateRandomTarget = () => {
    const minX = -50, maxX = 50;
    const minZ = -50, maxZ = 50;

    const x = Math.random() * (maxX - minX) + minX;
    const z = Math.random() * (maxZ - minZ) + minZ;

    randomTarget.current.set(x, 0, z);
  };

  const resetState = () => {
    hitCount.current = 0; // Reset hit count
    isDead.current = false; // Reset death state
    velocity.current.set(0, 0, 5); // Reset velocity
  
    if (ref.current) {
      ref.current.position.set(...respawnPosition.current); // Reset position
    }
  
    Object.values(actions.current).forEach((action) => {
      action.stop();
      action.reset();
    });
  
    playAnimation("run"); // Start running animation
  };

  const handleHit = () => {
    if (isDead.current) return;
  
    hitCount.current += 1;
  
    if (hitCount.current === 1) {
      playAnimation("run");
    } else if (hitCount.current >= 3) {
      isDead.current = true;
  
      Object.values(actions.current).forEach((action) => action.stop());
      if (actions.current["die"]) {
        const dieAction = actions.current["die"];
        dieAction.reset();
        dieAction.setLoop(THREE.LoopOnce, 1);
        dieAction.clampWhenFinished = true;
        dieAction.play();
  
        // Play roar sound as a fresh instance
        grunt();
  
        mixer.current.addEventListener("finished", (event) => {
          if (event.action === dieAction) {
            playAttackScream();
            resetState(); // Reset Bigfoot state for respawn
          }
        });
      }
  
      onHit(id); // Notify game logic
    }
  };

  const moveTowardPlayer = (delta) => {
    if (!playerPosition) return;

    const playerPos = new THREE.Vector3(...playerPosition);
    const direction = playerPos.clone().sub(ref.current.position).normalize();
    const speed = 2;

    velocity.current.lerp(direction.multiplyScalar(speed), 0.1); // Smooth adjustment
  };

  const playAnimation = (animationName) => {
    if (actions.current[animationName]) {
      const currentAction = Object.keys(actions.current).find((key) =>
        actions.current[key]?.isRunning()
      
      );

      if (currentAction === animationName) return;

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
    if (!mixer.current || !ref.current) return;
    mixer.current.update(delta);

    if (isDead.current) return;

    const playerPos = playerPosition ? new THREE.Vector3(...playerPosition) : null;
    const distanceToPlayer = playerPos ? ref.current.position.distanceTo(playerPos) : Infinity;

    if (distanceToPlayer < 2) {
      // Attack logic
      if (!attackCooldown.current) {
        attackCooldown.current = true;

        velocity.current.set(0, 0, 0); // Stop movement during attack
        playAnimation("attack");

        const directionToPlayer = playerPos.clone().sub(ref.current.position).normalize();
        const angle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, angle, 0.1);

        onPlayerHit(id);

        setTimeout(() => {
          attackCooldown.current = false;
          if (!isDead.current) {
            playAnimation("run");
            velocity.current.set(0, 0, 5); // Resume movement
          }
        }, 1000);
      }
      return;
    }

    if (distanceToPlayer < 10) {
      moveTowardPlayer(delta);
      playAnimation("run");
    } else {
      // Random movement
      randomTargetTimer.current += delta;

      if (randomTargetTimer.current > 3) {
        generateRandomTarget();
        randomTargetTimer.current = 0;
      }

      const directionToTarget = randomTarget.current.clone().sub(ref.current.position).normalize();
      velocity.current.lerp(directionToTarget.multiplyScalar(2), 0.1);
      playAnimation("run");

      if (ref.current.position.distanceTo(randomTarget.current) < 1) {
        generateRandomTarget();
      }
    }

    const moveVector = velocity.current.clone().multiplyScalar(delta);
    ref.current.position.add(moveVector);

    const targetDirection = velocity.current.clone().normalize();
    const angle = Math.atan2(targetDirection.x, targetDirection.z);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, angle, 0.05);

    boundingBox.current.setFromObject(ref.current);
    if (setBoundingBox) setBoundingBox(boundingBox.current);
  });

  return <primitive ref={ref} object={scene} scale={[4, 4, 4]} onPointerDown={handleHit} />;
};

export default Enemy;