import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import useSound from "./useSound";

const SAFE_EDGE_PADDING = 1.5;
const DETECT_DISTANCE = 18;
const ATTACK_DISTANCE = 3;
const CHASE_SPEED = 3.2;
const WANDER_SPEED = 1.4;
const MIN_DEATH_DISPLAY_MS = 2200;

const clampToBoundary = (position, boundary) => {
  if (!boundary) return;

  position.x = THREE.MathUtils.clamp(
    position.x,
    boundary.minX + SAFE_EDGE_PADDING,
    boundary.maxX - SAFE_EDGE_PADDING,
  );
  position.z = THREE.MathUtils.clamp(
    position.z,
    boundary.minZ + SAFE_EDGE_PADDING,
    boundary.maxZ - SAFE_EDGE_PADDING,
  );
};

const Enemy = ({
  id,
  position,
  boundary,
  setBoundingBox,
  playerRef,
  isDead = false,
  canAttackAt = 0,
  speedMultiplier = 1,
  attackCooldownMs = 1650,
  attackHitDelayMs = 900,
  gameOver = false,
  onAttackPlayer = () => {},
  onDeathAnimationComplete = () => {},
}) => {
  const { scene, animations } = useGLTF(
    "https://storage.googleapis.com/new-music/bigfootw%3Ajumpanddie.glb",
  );

  const model = useMemo(() => cloneSkeleton(scene), [scene]);
  const ref = useRef();
  const mixer = useRef(null);
  const actions = useRef({});
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const attackCooldown = useRef(false);
  const attackHitTimeout = useRef(null);
  const attackResetTimeout = useRef(null);
  const isDeadRef = useRef(isDead);
  const gameOverRef = useRef(gameOver);
  const currentAnimation = useRef("");
  const randomDirection = useRef(new THREE.Vector3(1, 0, 0));
  const box = useRef(new THREE.Box3());
  const deathStarted = useRef(false);
  const deathTimeout = useRef(null);

  const playGrunt = useSound(
    "https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3",
    false,
    0.5,
  );
  const playDeathRoar = useSound(
    "https://storage.googleapis.com/new-music/monster-roar-02-102957%20(1).mp3",
    false,
    0.6,
  );

  useEffect(() => {
    isDeadRef.current = isDead;
    gameOverRef.current = gameOver;
  }, [gameOver, isDead]);

  useEffect(() => {
    if (!ref.current) return;

    if (isDead) return;

    if (deathTimeout.current) {
      window.clearTimeout(deathTimeout.current);
      deathTimeout.current = null;
    }

    ref.current.visible = true;
    ref.current.position.set(position[0], position[1], position[2]);
    clampToBoundary(ref.current.position, boundary);
    deathStarted.current = false;
    attackCooldown.current = false;
    if (attackHitTimeout.current) window.clearTimeout(attackHitTimeout.current);
    if (attackResetTimeout.current) window.clearTimeout(attackResetTimeout.current);
    attackHitTimeout.current = null;
    attackResetTimeout.current = null;
    currentAnimation.current = "";
    playAnimation("run");
  }, [boundary, isDead, position]);

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(model);
    actions.current = {};

    animations.forEach((clip) => {
      const action = mixer.current.clipAction(clip, model);
      actions.current[clip.name.toLowerCase()] = action;
    });

    console.log("Bigfoot animations:", animations.map((clip) => clip.name));
    playAnimation("run");

    return () => {
      if (deathTimeout.current) window.clearTimeout(deathTimeout.current);
      if (attackHitTimeout.current) window.clearTimeout(attackHitTimeout.current);
      if (attackResetTimeout.current) window.clearTimeout(attackResetTimeout.current);
      mixer.current?.stopAllAction();
    };
  }, [animations, model]);

  useEffect(() => {
    if (!isDead || deathStarted.current) return;

    deathStarted.current = true;
    velocity.current.set(0, 0, 0);
    attackCooldown.current = false;
    if (attackHitTimeout.current) window.clearTimeout(attackHitTimeout.current);
    if (attackResetTimeout.current) window.clearTimeout(attackResetTimeout.current);
    attackHitTimeout.current = null;
    attackResetTimeout.current = null;
    playDeathRoar({ restart: true });

    const deathAction = getDeathAction();
    const deathDurationMs = deathAction
      ? Math.max(MIN_DEATH_DISPLAY_MS, deathAction.getClip().duration * 1000)
      : MIN_DEATH_DISPLAY_MS;

    if (deathAction) {
      deathAction.setLoop(THREE.LoopOnce, 1);
      deathAction.clampWhenFinished = true;
      playAction(deathAction, "death");
    } else {
      console.warn("No Bigfoot death animation found. Known actions:", Object.keys(actions.current));
    }

    deathTimeout.current = window.setTimeout(() => {
      onDeathAnimationComplete(id);
    }, deathDurationMs);
  }, [id, isDead, onDeathAnimationComplete]);

  const getDeathAction = () => {
    const keys = Object.keys(actions.current);
    const preferredKey =
      keys.find((name) => name === "die") ||
      keys.find((name) => name === "death") ||
      keys.find((name) => name.includes("die")) ||
      keys.find((name) => name.includes("death")) ||
      keys.find((name) => name.includes("jump"));

    if (preferredKey) return actions.current[preferredKey];

    const fallbackKey = keys
      .filter((name) => !name.includes("run") && !name.includes("walk") && !name.includes("attack"))
      .sort((a, b) => {
        const durationA = actions.current[a]?._clip?.duration || 0;
        const durationB = actions.current[b]?._clip?.duration || 0;
        return durationB - durationA;
      })[0];

    return fallbackKey ? actions.current[fallbackKey] : null;
  };

  const playAction = (action, label) => {
    Object.values(actions.current).forEach((otherAction) => {
      if (otherAction !== action) otherAction.fadeOut(0.15);
    });
    action.reset().fadeIn(0.15).play();
    currentAnimation.current = label;
  };

  const playAnimation = (name) => {
    if (currentAnimation.current === name || !actions.current[name]) return;
    playAction(actions.current[name], name);
  };

  useFrame((_, delta) => {
    if (!ref.current || !mixer.current) return;

    mixer.current.update(delta);

    if (isDead || gameOver) {
      box.current.setFromObject(ref.current);
      setBoundingBox?.(box.current.clone(), ref.current.position.toArray());
      return;
    }

    const playerPos = playerRef.current?.position.clone();
    if (!playerPos) return;
    const enemyPos = ref.current.position;
    const distanceToPlayer = enemyPos.distanceTo(playerPos);

    if (distanceToPlayer < ATTACK_DISTANCE) {
      velocity.current.set(0, 0, 0);

      if (performance.now() >= canAttackAt && !attackCooldown.current) {
        attackCooldown.current = true;
        playAnimation("attack");
        playGrunt({ restart: true });

        attackHitTimeout.current = window.setTimeout(() => {
          if (!ref.current || isDeadRef.current || gameOverRef.current) return;

          const latestPlayerPos = playerRef.current?.position;
          if (!latestPlayerPos) return;
          const latestDistance = ref.current.position.distanceTo(latestPlayerPos);

          if (latestDistance < ATTACK_DISTANCE + 0.45) {
            onAttackPlayer();
          }
        }, attackHitDelayMs);

        attackResetTimeout.current = window.setTimeout(() => {
          if (isDeadRef.current || gameOverRef.current) return;
          attackCooldown.current = false;
          playAnimation("run");
        }, attackCooldownMs);
      }
    } else if (distanceToPlayer < DETECT_DISTANCE) {
      const direction = playerPos.sub(enemyPos);
      direction.y = 0;
      direction.normalize();
      velocity.current.copy(direction.multiplyScalar(CHASE_SPEED * speedMultiplier));
      playAnimation("run");
    } else {
      if (velocity.current.lengthSq() === 0 || Math.random() < 0.015) {
        randomDirection.current
          .set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1)
          .normalize();
        velocity.current.copy(
          randomDirection.current.multiplyScalar(WANDER_SPEED * speedMultiplier),
        );
      }
      playAnimation("run");
    }

    const moveVector = velocity.current.clone().multiplyScalar(delta);
    ref.current.position.add(moveVector);
    clampToBoundary(ref.current.position, boundary);

    if (velocity.current.lengthSq() > 0.0001) {
      const lookTarget = ref.current.position.clone().add(velocity.current);
      lookTarget.y = ref.current.position.y;
      ref.current.lookAt(lookTarget);
    }

    box.current.setFromObject(ref.current);
    setBoundingBox?.(box.current.clone(), ref.current.position.toArray());
  });

  return <primitive ref={ref} object={model} scale={[4, 4, 4]} />;
};

export default Enemy;
