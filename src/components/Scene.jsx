import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Enemy from "./Enemy";
import Particle from "./Particle";
import Weapon from "./Weapon";
import Floor from "./Floor";
import useSound from "./useSound";
import { v4 as uuidv4 } from "uuid";

const PLAYER_START = [0, 0.5, 0];
const PLAYER_EYE_HEIGHT = 1.6;
const PLAYER_SPEED = 0.16;
const BULLET_DAMAGE = 40;
const BULLET_RANGE = 90;
const ENEMY_HIT_RADIUS = 2.6;
const ENEMY_HIT_HEIGHT = 6;
const SAFE_EDGE_PADDING = 1.5;
const ENEMY_SPAWN_MIN_DISTANCE = 18;
const ENEMY_SPAWN_MAX_DISTANCE = 28;
const PLAYER_ASSESSMENT_GRACE_MS = 3500;

const getDifficulty = (kills) => {
  if (kills >= 10) {
    return {
      maxEnemies: 2,
      health: 160,
      speedMultiplier: 1.35,
      attackCooldownMs: 1150,
      attackHitDelayMs: 650,
      attackDamage: 34,
      respawnDelayMs: 1100,
    };
  }
  if (kills >= 6) {
    return {
      maxEnemies: 1,
      health: 140,
      speedMultiplier: 1.25,
      attackCooldownMs: 1300,
      attackHitDelayMs: 750,
      attackDamage: 38,
      respawnDelayMs: 1400,
    };
  }
  if (kills >= 3) {
    return {
      maxEnemies: 1,
      health: 100,
      speedMultiplier: 1.15,
      attackCooldownMs: 1450,
      attackHitDelayMs: 825,
      attackDamage: 34,
      respawnDelayMs: 1600,
    };
  }
  return {
    maxEnemies: 1,
    health: 100,
    speedMultiplier: 1,
    attackCooldownMs: 1650,
    attackHitDelayMs: 900,
    attackDamage: 34,
    respawnDelayMs: 1800,
  };
};

const fallbackBoundary = {
  minX: -35,
  maxX: 35,
  minZ: -35,
  maxZ: 35,
};

const clampToBoundary = (position, boundary = fallbackBoundary) => {
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

const spawnEnemyPosition = ({
  boundary = fallbackBoundary,
  playerPosition = new THREE.Vector3(...PLAYER_START),
  playerForward = new THREE.Vector3(0, 0, -1),
} = {}) => {
  const baseForward = playerForward.clone();
  baseForward.y = 0;
  baseForward.normalize();

  const angle = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(90));
  const distance = THREE.MathUtils.randFloat(
    ENEMY_SPAWN_MIN_DISTANCE,
    ENEMY_SPAWN_MAX_DISTANCE,
  );
  const spawnDirection = baseForward.clone().applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    angle,
  );

  const position = playerPosition.clone().add(spawnDirection.multiplyScalar(distance));
  position.y = 0.5;
  clampToBoundary(position, boundary);

  return [position.x, position.y, position.z];
};

const Scene = ({
  gameOver,
  handlePlayerHit,
  handleEnemyDeath,
  handleAmmoUsage,
  handleReloadComplete,
  inputEnabled,
  onReloadStateChange,
  onWeaponFire,
  kills,
}) => {
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const { camera } = useThree();
  const playerRef = useRef();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const boundaryRef = useRef(fallbackBoundary);
  const enemyRuntimeRef = useRef(new Map());
  const difficulty = getDifficulty(kills);
  const playBulletHitGroan = useSound(
    "https://storage.googleapis.com/new-music/bigfoot-grunt-233699.mp3",
    false,
    0.8,
  );

  const [floorBoundary, setFloorBoundary] = useState(fallbackBoundary);

  const getPlayerPosition = () =>
    playerRef.current?.position.clone() || new THREE.Vector3(...PLAYER_START);

  const getPlayerForward = () => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    return forward;
  };

  const createEnemy = () => {
    const position = spawnEnemyPosition({
      boundary: boundaryRef.current,
      playerPosition: getPlayerPosition(),
      playerForward: getPlayerForward(),
    });

    return {
      id: uuidv4(),
      position,
      health: difficulty.health,
      canAttackAt: performance.now() + PLAYER_ASSESSMENT_GRACE_MS,
      dead: false,
    };
  };

  useEffect(() => {
    boundaryRef.current = floorBoundary;
  }, [floorBoundary]);

  useEffect(() => {
    setEnemies((prev) => {
      if (prev.length >= difficulty.maxEnemies) return prev;
      const amountToAdd = difficulty.maxEnemies - prev.length;
      return [
        ...prev,
        ...Array.from({ length: amountToAdd }).map(() => createEnemy()),
      ];
    });
  }, [difficulty.maxEnemies]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (keys.current[key] !== undefined) keys.current[key] = true;
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (keys.current[key] !== undefined) keys.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!playerRef.current || gameOver) return;

    const forward = getPlayerForward();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    const movement = new THREE.Vector3();

    if (keys.current.w) movement.add(forward);
    if (keys.current.s) movement.sub(forward);
    if (keys.current.d) movement.add(right);
    if (keys.current.a) movement.sub(right);

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(PLAYER_SPEED);
      playerRef.current.position.add(movement);
      clampToBoundary(playerRef.current.position, boundaryRef.current);
    }

    camera.position.set(
      playerRef.current.position.x,
      playerRef.current.position.y + PLAYER_EYE_HEIGHT,
      playerRef.current.position.z,
    );
  });

  const handleEnemyBoundingBox = (enemyId, boundingBox, currentPosition) => {
    enemyRuntimeRef.current.set(enemyId, { boundingBox, currentPosition });
  };

  const handleEnemyAttack = () => {
    if (gameOver) return;
    handlePlayerHit(difficulty.attackDamage);
  };

  const handleEnemyDeathAnimationComplete = (enemyId) => {
    if (gameOver) return;

    setEnemies((prev) =>
      prev.map((enemy) =>
        enemy.id === enemyId
          ? {
              ...enemy,
              position: spawnEnemyPosition({
                boundary: boundaryRef.current,
                playerPosition: getPlayerPosition(),
                playerForward: getPlayerForward(),
              }),
              health: difficulty.health,
              canAttackAt: performance.now() + PLAYER_ASSESSMENT_GRACE_MS,
              dead: false,
            }
          : enemy,
      ),
    );
    enemyRuntimeRef.current.delete(enemyId);
  };

  const handleCollision = (enemyId) => {
    if (gameOver) return;

    const targetEnemy = enemies.find(
      (enemy) => enemy.id === enemyId && !enemy.dead,
    );
    if (!targetEnemy) return;

    const nextHealth = Math.max(targetEnemy.health - BULLET_DAMAGE, 0);

    if (nextHealth <= 0) {
      handleEnemyDeath();
    } else {
      playBulletHitGroan({ restart: true });
    }

    setEnemies((prev) =>
      prev.map((enemy) => {
        if (enemy.id !== enemyId || enemy.dead) return enemy;

        if (nextHealth <= 0) {
          return {
            ...enemy,
            health: 0,
            dead: true,
          };
        }

        return { ...enemy, health: nextHealth };
      }),
    );
  };

  const getShotHitEnemyId = (start, direction) => {
    const shotRay = new THREE.Ray(start, direction.clone().normalize());
    let closestHit = null;

    enemies.forEach((enemy) => {
      if (enemy.dead) return;

      const runtime = enemyRuntimeRef.current.get(enemy.id);
      const enemyPosition = new THREE.Vector3(
        ...(runtime?.currentPosition || enemy.position),
      );
      const enemyBodyCenter = enemyPosition.clone();
      enemyBodyCenter.y += ENEMY_HIT_HEIGHT * 0.5;
      const closestPointOnShot = shotRay.closestPointToPoint(enemyBodyCenter, new THREE.Vector3());
      const distanceDownShot = start.distanceTo(closestPointOnShot);

      if (distanceDownShot > BULLET_RANGE) return;

      const verticalDelta = Math.abs(closestPointOnShot.y - enemyBodyCenter.y);
      const horizontalDelta = new THREE.Vector2(
        closestPointOnShot.x - enemyBodyCenter.x,
        closestPointOnShot.z - enemyBodyCenter.z,
      ).length();

      if (
        verticalDelta > ENEMY_HIT_HEIGHT * 0.65 ||
        horizontalDelta > ENEMY_HIT_RADIUS
      ) {
        return;
      }

      if (!closestHit || distanceDownShot < closestHit.distance) {
        closestHit = { id: enemy.id, distance: distanceDownShot };
      }
    });

    return closestHit?.id || null;
  };

  return (
    <>
      <mesh ref={playerRef} position={PLAYER_START} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      <Floor setFloorBoundary={setFloorBoundary} />

      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          id={enemy.id}
          boundary={floorBoundary}
          canAttackAt={enemy.canAttackAt}
          gameOver={gameOver}
          isDead={enemy.dead}
          position={enemy.position}
          playerRef={playerRef}
          speedMultiplier={difficulty.speedMultiplier}
          attackCooldownMs={difficulty.attackCooldownMs}
          attackHitDelayMs={difficulty.attackHitDelayMs}
          setBoundingBox={(boundingBox, currentPosition) =>
            handleEnemyBoundingBox(enemy.id, boundingBox, currentPosition)
          }
          onAttackPlayer={handleEnemyAttack}
          onDeathAnimationComplete={() =>
            window.setTimeout(
              () => handleEnemyDeathAnimationComplete(enemy.id),
              difficulty.respawnDelayMs,
            )
          }
        />
      ))}

      <Weapon
        enabled={inputEnabled && !gameOver}
        onReloadStateChange={onReloadStateChange}
        onFire={(start, direction) => {
          if (gameOver) return;
          onWeaponFire?.();
          setParticles((prev) => [...prev, { id: uuidv4(), start, direction }]);
          const hitEnemyId = getShotHitEnemyId(start, direction);
          if (hitEnemyId) handleCollision(hitEnemyId);
          handleAmmoUsage();
        }}
        onReloadComplete={handleReloadComplete}
      />

      {particles.map((particle) => (
        <Particle
          key={particle.id}
          start={particle.start}
          direction={particle.direction}
          enemies={[]}
          onCollision={() => {}}
          onRemove={() =>
            setParticles((prev) => prev.filter((p) => p.id !== particle.id))
          }
        />
      ))}
    </>
  );
};

export default Scene;
