import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointerLockControls, Sky,  } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import BigFoot from "./components/BigFoot";
import Avatar from "./components/Avatar";
const FPSControls = () => {
  const { camera } = useThree();
  
  return <PointerLockControls args={[camera]} />;
};

const Player = () => {
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keysPressed = useRef({});
  const playerRef = useRef();

  useEffect(() => {
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
    const speed = 0.1;
    const player = playerRef.current;

    if (!player) return;

    // Reset direction
    direction.current.set(0, 0, 0);

    // Determine movement direction
    if (keysPressed.current["w"]) direction.current.z -= speed;
    if (keysPressed.current["s"]) direction.current.z += speed;
    if (keysPressed.current["a"]) direction.current.x -= speed;
    if (keysPressed.current["d"]) direction.current.x += speed;

    direction.current.normalize();

    // Update player position
    player.position.add(direction.current);
  });

  return (
    <mesh ref={playerRef} position={[0, 1, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const Terrain = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

const Scene = () => {
  const cameraRef = useRef();
  return (
    <>
    <Sky />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Player />
      <BigFoot position={[0, 0, 0]} scale={[10, 10, 10]} camera={cameraRef.current} />
      <Avatar position={[0, 0, 2]} scale={[2, 2, 2]}/>
      <Terrain />
    </>
  );
};

const App = () => {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 100 }}>

        <Scene />
        <FPSControls />
      </Canvas>
    </div>
  );
};

export default App;