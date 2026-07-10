import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particle = ({ start, direction, enemies, onCollision, onRemove }) => {
  const ref = useRef();
  const traveledDistance = useRef(0);
  const hasHit = useRef(false);
  const ray = useRef(new THREE.Ray());
  const intersection = useRef(new THREE.Vector3());
  const maxDistance = 80;
  const speed = 0.85;

  useFrame(() => {
    if (!ref.current || hasHit.current) return;

    const previousPosition = ref.current.position.clone();
    const move = direction.clone().normalize().multiplyScalar(speed);
    ref.current.position.add(move);
    traveledDistance.current += move.length();

    if (traveledDistance.current > maxDistance) {
      hasHit.current = true;
      onRemove();
      return;
    }

    for (const enemy of enemies) {
      if (!enemy.boundingBox) continue;

      ray.current.set(previousPosition, move.clone().normalize());
      const hitPoint = ray.current.intersectBox(
        enemy.boundingBox,
        intersection.current,
      );

      if (
        enemy.boundingBox.containsPoint(ref.current.position) ||
        (hitPoint && previousPosition.distanceTo(hitPoint) <= move.length())
      ) {
        hasHit.current = true;
        onCollision(enemy.id);
        onRemove();
        return;
      }
    }
  });

  return (
    <mesh ref={ref} position={start}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

export default Particle;
