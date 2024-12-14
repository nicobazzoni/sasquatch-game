import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useSound from "./useSound";

const Enemy = ({ id, position, setBoundingBox, playerPosition, onHit, onPlayerHit }) => {
  const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/bigfootw%3Ajumpanddie.glb");
  const ref = useRef();
  const mixer = useRef(null);
  const boundingBox = useRef(new THREE.Box3());
  const actions = useRef({});
  const hitCount = useRef(0);
  const isDead = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 2)); // Start with default velocity
  const respawnPosition = useRef(position.slice());
  const attackCooldown = useRef(false);
  const randomTarget = useRef(new THREE.Vector3());
const randomTargetTimer = useRef(0);

  const deathCry = useSound("https://storage.googleapis.com/new-music/ESM_HC3_cinematic_fx_voice_bigfoot_pain_grunt_painful_roar_growl.wav");

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
  }, [animations, scene]);

  const generateRandomTarget = () => {
    const minX = -50, maxX = 50;
    const minZ = -50, maxZ = 50;
  
    const x = Math.random() * (maxX - minX) + minX;
    const z = Math.random() * (maxZ - minZ) + minZ;
  
    randomTarget.current.set(x, 0, z);
    console.log("New Random Target:", randomTarget.current);
  };

  const resetState = () => {
    hitCount.current = 0;
    isDead.current = false;
    velocity.current.set(0, 0, 2); // Default speed

    if (ref.current) {
      ref.current.position.set(...respawnPosition.current);
    }

    Object.values(actions.current).forEach((action) => {
      action.stop();
      action.reset();
    });

    playAnimation("run");
  };

  const handleHit = () => {
    if (isDead.current) return;

    hitCount.current += 1;
    console.log(`Hit Count: ${hitCount.current}`);

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
        deathCry();

        mixer.current.addEventListener("finished", (event) => {
          if (event.action === dieAction) {
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
  
        if (onPlayerHit) onPlayerHit(id);
  
        setTimeout(() => {
          attackCooldown.current = false;
          if (!isDead.current) {
            playAnimation("run");
            velocity.current.set(0, 0, 2); // Resume movement
          }
        }, 1000);
      }
      return;
    }
  
    if (distanceToPlayer < 10) {
      // Chase player
      moveTowardPlayer(delta);
      playAnimation("run");
    } else {
      // Random movement
      randomTargetTimer.current += delta;
  
      if (randomTargetTimer.current > 3) {
        generateRandomTarget(); // Generate a new random target every 3 seconds
        randomTargetTimer.current = 0;
      }
  
      const directionToTarget = randomTarget.current.clone().sub(ref.current.position).normalize();
      velocity.current.lerp(directionToTarget.multiplyScalar(2), 0.1); // Move toward target
      playAnimation("run");
  
      // Check if Bigfoot has reached the target
      if (ref.current.position.distanceTo(randomTarget.current) < 1) {
        generateRandomTarget(); // Generate a new target if close
      }
    }
  
    if (velocity.current.length() < 0.01 && !isDead.current) {
      velocity.current.set(0, 0, 2); // Wake up Bigfoot if stuck
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