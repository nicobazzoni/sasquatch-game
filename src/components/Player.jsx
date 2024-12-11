import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const Player = ({ modelUrl }) => {
  const bigFootRef = useRef();
  const keysPressed = useRef({});
  const { camera } = useThree();

  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    // Setup key handling
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!bigFootRef.current) return;

    const moveVector = new THREE.Vector3();

    if (keysPressed.current["w"]) moveVector.z -= 0.1; // Forward
    if (keysPressed.current["s"]) moveVector.z += 0.1; // Backward
    if (keysPressed.current["a"]) moveVector.x -= 0.1; // Left
    if (keysPressed.current["d"]) moveVector.x += 0.1; // Right

    bigFootRef.current.position.add(moveVector);

    // Camera follow
    const position = bigFootRef.current.position.clone();
    camera.position.set(position.x, position.y + 2, position.z - 5);
    camera.lookAt(position);

    console.log("BigFoot Position:", bigFootRef.current.position);
  });

  return <primitive ref={bigFootRef} object={scene} />;
};

export default Player;