import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useSound from "./useSound";

const Enemy = ({
  id,
  position,
  setBoundingBox,
  playerPosition,
  onDeath = () => {},
  onPlayerHit = () => {},
}) => {
  const { scene, animations } = useGLTF(
    "https://storage.googleapis.com/new-music/bigfootw%3Ajumpanddie.glb"
  );

  const ref = useRef();
  const mixer = useRef(null);
  const actions = useRef({});
  const hitCount = useRef(0);
  const isDead = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const attackCooldown = useRef(false);
  const currentAnimation = useRef("");
  const minimumAttackDistance = 3;
  const bufferDistance = 2.5; // Prevents too-close attacks
  const deathHandled = useRef(false);
  const shouldPlayGrunt = useRef(false);
  const BOUNDARY = {
    minX: -50,
    maxX: 50,
    minZ: -50,
    maxZ: 50,
  };
  const randomDirection = new THREE.Vector3();
  // Sounds
  const playGrunt = useSound(
    "https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3"
  );
  const playDeathRoar = useSound(
    "https://storage.googleapis.com/new-music/monster-roar-02-102957%20(1).mp3"
  );

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(scene);
  
    animations.forEach((clip) => {
      actions.current[clip.name.toLowerCase()] = mixer.current.clipAction(clip, ref.current);
    });
  
    console.log("Available animations:", Object.keys(actions.current)); // Debugging
  
    if (actions.current["run"]) {
      playAnimation("run");
    } else {
      console.warn("No 'idle' animation found!");
    }
  
    resetState();
    return () => mixer.current?.stopAllAction();
  }, [animations, scene]);

  const resetState = () => {
    isDead.current = false;
    deathHandled.current = false;
    hitCount.current = 0;
    velocity.current.set(0, 0, 5);
  
    // Ensure Bigfoot spawns some distance away from the player
    if (ref.current) {
      const spawnOffset = new THREE.Vector3(
        Math.random() * 10 - 5, // Random x offset
        0,
        Math.random() * 10 + 5 // Random z offset in front of the player
      );
      const spawnPosition = new THREE.Vector3(...playerPosition).add(spawnOffset);
      ref.current.position.copy(spawnPosition);
      ref.current.userData.gruntPlayed = false;
      ref.current.userData.isHit = false;
    }
  
    playAnimation("run"); 
  };
  useEffect(() => {
    // Play grunt sound every 30 seconds
    const gruntInterval = setInterval(() => {
      if (!isDead.current && velocity.current.length() === 0) {
        playGrunt();
        console.log("Bigfoot makes a grunt sound!");
      }
    }, 10000); // 30,000 ms = 30 seconds
  
    return () => clearInterval(gruntInterval); // Cleanup interval on unmount
  }, [playGrunt]);

  const playAnimation = (name) => {
    if (currentAnimation.current === name || !actions.current[name]) return;

    Object.values(actions.current).forEach((action) => action.fadeOut(0.3));
    actions.current[name].reset().fadeIn(0.3).play();
    currentAnimation.current = name;
  };

  useFrame((_, delta) => {
    if (!ref.current || !mixer.current) return;
  
    // Update animations
    mixer.current.update(delta);
  
    // EARLY EXIT IF DEAD
    if (isDead.current) {
      velocity.current.set(0, 0, 0); // Stop all movement
      return; // Skip further logic
    }
  
    const playerPos = new THREE.Vector3(...playerPosition);
    const distanceToPlayer = ref.current.position.distanceTo(playerPos);
  
    // ATTACK LOGIC: Engage player
    if (distanceToPlayer < minimumAttackDistance) {
      velocity.current.set(0, 0, 0); // Stop movement
      if (!attackCooldown.current) {
        attackCooldown.current = true;
  
        playAnimation("attack");
        onPlayerHit();
  
        setTimeout(() => {
          attackCooldown.current = false;
          if (!isDead.current) playAnimation("run"); // Ensure no attack after death
        }, 1500);
      }
      return; // Skip further logic when attacking
    }
  
    // RUN LOGIC: Chase player when close enough
    if (distanceToPlayer < 12) {
      const direction = playerPos.clone().sub(ref.current.position).normalize();
      velocity.current.copy(direction.multiplyScalar(3)); // Move toward player
      playAnimation("run");
    } else {
      // WANDER LOGIC: Random movement
      if (velocity.current.length() === 0 || Math.random() < 0.01) {
        randomDirection.set(
          Math.random() * 2 - 1,
          0,
          Math.random() * 2 - 1
        ).normalize();
        velocity.current.copy(randomDirection.multiplyScalar(2)); // Adjust wandering speed
      }
      playAnimation("run");
    }
  
    // APPLY MOVEMENT
    const moveVector = velocity.current.clone().multiplyScalar(delta);
    ref.current.position.add(moveVector);
  
    // BOUNDARY LOGIC: Keep Bigfoot inside the world
    if (ref.current.position.x < BOUNDARY.minX) {
      ref.current.position.x = BOUNDARY.minX + 1;
      velocity.current.x = Math.abs(velocity.current.x);
    }
    if (ref.current.position.x > BOUNDARY.maxX) {
      ref.current.position.x = BOUNDARY.maxX - 1;
      velocity.current.x = -Math.abs(velocity.current.x);
    }
    if (ref.current.position.z < BOUNDARY.minZ) {
      ref.current.position.z = BOUNDARY.minZ + 1;
      velocity.current.z = Math.abs(velocity.current.z);
    }
    if (ref.current.position.z > BOUNDARY.maxZ) {
      ref.current.position.z = BOUNDARY.maxZ - 1;
      velocity.current.z = -Math.abs(velocity.current.z);
    }
  
    // ROTATE TO FACE MOVEMENT DIRECTION
    if (velocity.current.length() > 0) {
      const angle = Math.atan2(velocity.current.x, velocity.current.z);
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        angle,
        0.1
      );
    }
  });
  
  
  const handleHit = () => {
    if (isDead.current) return; // Prevent further hits after death
  
    hitCount.current += 1;
  
    if (hitCount.current >= 3) {
      isDead.current = true;
  
      // Stop all current animations and play death animation
      Object.values(actions.current).forEach((action) => action.stop());
      playAnimation("die",);
      playDeathRoar(0.3);
  
      const dieAction = actions.current["die"];
      if (dieAction) {
        dieAction.setLoop(THREE.LoopOnce, 1);
        dieAction.clampWhenFinished = true;
        dieAction.play();
  
        mixer.current.addEventListener("finished", (e) => {
          if (e.action === dieAction) {
            onDeath(id);
            resetState(); // Reset after death
          }
        });
      } else {
        onDeath(id);
        resetState();
      }
    }
  };
  

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