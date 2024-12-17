import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useSound from "./useSound";
import { useGameContext } from "../GameContext";
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
  const deathHandled = useRef(false);
  const minimumAttackDistance = 3;
  const randomDirection = new THREE.Vector3();
  const { handleEnemyDeath } = useGameContext(); 
  // Sounds
  const playGrunt = useSound("https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3");
  const playDeathRoar = useSound("https://storage.googleapis.com/new-music/monster-roar-02-102957%20(1).mp3");

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(scene);
    animations.forEach((clip) => {
      actions.current[clip.name.toLowerCase()] = mixer.current.clipAction(clip, ref.current);
    });

    resetState();
    return () => mixer.current?.stopAllAction();
  }, [animations, scene]);

  const resetState = () => {
    isDead.current = false;
    hitCount.current = 0;
    deathHandled.current = false;

    if (ref.current) {
      ref.current.position.set(
        Math.random() * 10 - 5,
        0,
        Math.random() * 10 + 5
      );
    }

    Object.values(actions.current).forEach((action) => action.stop());
    playAnimation("run");
  };

  const playAnimation = (name) => {
    if (currentAnimation.current === name || !actions.current[name]) return;

    Object.values(actions.current).forEach((action) => action.fadeOut(0.3));
    actions.current[name].reset().fadeIn(0.3).play();
    currentAnimation.current = name;
  };

  const handleHit = () => {
    if (isDead.current) return;
  
    hitCount.current += 1;
  
    if (hitCount.current >= 3 && !deathHandled.current) {
      isDead.current = true;
      deathHandled.current = true;
  
      playAnimation("die");
      playDeathRoar();
  
      // Notify Scene about death
      onDeath(id);
  
      const dieAction = actions.current["die"];
      if (dieAction) {
        dieAction.setLoop(THREE.LoopOnce, 1);
        dieAction.clampWhenFinished = true;
        dieAction.play();
  
        mixer.current.addEventListener("finished", () => resetState());
      } else {
        resetState();
      }
    }
  };
  
  useFrame((_, delta) => {
    if (!ref.current || !mixer.current) return;

    mixer.current.update(delta);

    if (isDead.current) return;

    const playerPos = new THREE.Vector3(...playerPosition);
    const distanceToPlayer = ref.current.position.distanceTo(playerPos);

    if (distanceToPlayer < minimumAttackDistance) {
      velocity.current.set(0, 0, 0);
      if (!attackCooldown.current) {
        attackCooldown.current = true;
        playAnimation("attack");
        onPlayerHit();

        setTimeout(() => {
          attackCooldown.current = false;
          if (!isDead.current) playAnimation("run");
        }, 1500);
      }
      return;
    }

    // Movement logic
    if (distanceToPlayer < 12) {
      const direction = playerPos.clone().sub(ref.current.position).normalize();
      velocity.current.copy(direction.multiplyScalar(3));
      playAnimation("run");
    } else if (velocity.current.length() === 0 || Math.random() < 0.01) {
      randomDirection.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();
      velocity.current.copy(randomDirection.multiplyScalar(2));
      playAnimation("run");
    }

    const moveVector = velocity.current.clone().multiplyScalar(delta);
    ref.current.position.add(moveVector);
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={[4, 4, 4]}
      onPointerDown={(e) => {
        e.stopPropagation();
        handleHit();
        handleEnemyDeath()
        onAnotherFunction(); // Call another function
      }}
    />
  );
};

export default Enemy;