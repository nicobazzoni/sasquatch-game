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
  const boundingBox = useRef(new THREE.Box3());
  const actions = useRef({});
  const hitCount = useRef(0);
  const isDead = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const attackCooldown = useRef(false);
  const currentAnimation = useRef("idle");

  const randomTarget = useRef(new THREE.Vector3());
  const behaviorTimer = useRef(0); // Timer for random behavior switch
  const randomWalkTime = useRef(3 + Math.random() * 2); // 3-5 seconds for walk duration
  const isWalking = useRef(false);

  const playGrunt = useSound(
    "https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3"
  );
  const playDeathRoar = useSound(
    "https://storage.googleapis.com/new-music/monster-roar-02-102957%20(1).mp3"
  );

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(scene);
    animations.forEach((clip) => {
      actions.current[clip.name.toLowerCase()] = mixer.current.clipAction(
        clip,
        ref.current
      );
    });

    generateRandomTarget();
    resetState();
    return () => mixer.current?.stopAllAction();
  }, [animations, scene]);

  const resetState = () => {
    hitCount.current = 0;
    isDead.current = false;
    velocity.current.set(0, 0, 0);
    if (ref.current) {
      ref.current.position.set(...position);
    }
    playAnimation("idle");
  };

  const generateRandomTarget = () => {
    const range = 10;
    const x = position[0] + (Math.random() * range - range / 2);
    const z = position[2] + (Math.random() * range - range / 2);
    randomTarget.current.set(x, 0, z);
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

    if (hitCount.current >= 3) {
      isDead.current = true;
      playAnimation("die");
      playDeathRoar();

      const dieAction = actions.current["die"];
      if (dieAction) {
        dieAction.setLoop(THREE.LoopOnce, 1);
        dieAction.clampWhenFinished = true;

        dieAction.reset().play();
        mixer.current.addEventListener("finished", (e) => {
          if (e.action === dieAction) {
            onDeath(id);
            resetState();
          }
        });
      } else {
        onDeath(id);
        resetState();
      }
    }
  };

  useFrame((_, delta) => {
    if (!mixer.current || !ref.current) return;
    mixer.current.update(delta);

    if (isDead.current) {
      velocity.current.set(0, 0, 0);
      return;
    }

    const playerPos = new THREE.Vector3(...playerPosition);
    const distanceToPlayer = ref.current.position.distanceTo(playerPos);

    // ATTACK LOGIC
    if (distanceToPlayer < 3 && !attackCooldown.current) {
      attackCooldown.current = true;
      velocity.current.set(0, 0, 0);
      playAnimation("attack");
      playGrunt();

      setTimeout(() => {
        attackCooldown.current = false;
        if (!isDead.current) playAnimation("run");
      }, 1500);

      onPlayerHit(id);
      return;
    }

    // RUN LOGIC
    if (distanceToPlayer < 12) {
      const direction = playerPos.clone().sub(ref.current.position).normalize();
      velocity.current.lerp(direction.multiplyScalar(3), 0.1);
      playAnimation("run");
    }
    // RANDOM WALK AND IDLE LOGIC
    else {
      behaviorTimer.current += delta;

      if (isWalking.current) {
        const direction = randomTarget.current
          .clone()
          .sub(ref.current.position)
          .normalize();
        velocity.current.lerp(direction.multiplyScalar(1), 0.05);

        if (ref.current.position.distanceTo(randomTarget.current) < 0.5) {
          generateRandomTarget();
        }

        if (behaviorTimer.current > randomWalkTime.current) {
          isWalking.current = false;
          behaviorTimer.current = 0;
          playAnimation("idle");
        } else {
          playAnimation("walk");
        }
      } else {
        velocity.current.set(0, 0, 0);

        if (behaviorTimer.current > 3) {
          isWalking.current = true;
          behaviorTimer.current = 0;
          randomWalkTime.current = 3 + Math.random() * 2; // New random duration
          generateRandomTarget();
        }
        playAnimation("idle");
      }
    }

    // MOVE SMOOTHLY
    const moveVector = velocity.current.clone().multiplyScalar(delta);
    ref.current.position.add(moveVector);

    // FACE TARGET (PLAYER OR RANDOM POSITION)
    const targetDirection = velocity.current.clone().normalize();
    const angle = Math.atan2(targetDirection.x, targetDirection.z);
    if (velocity.current.length() > 0) {
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        angle,
        0.1
      );
    }

    // UPDATE BOUNDING BOX
    boundingBox.current.setFromObject(ref.current);
    setBoundingBox(boundingBox.current);
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