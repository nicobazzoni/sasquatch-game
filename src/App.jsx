import React from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Sky } from "@react-three/drei";
import { Physics } from "@react-three/cannon"; // Import Physics provider
import BigFoot from "./components/BigFoot";
import Ground from "./components/Ground";
import Rocks from "./components/Rocks";
import * as THREE from "three";

const FPSControls = () => {
  return <PointerLockControls />;
};

const Scene = () => {
  const [rocks, setRocks] = React.useState(
    Array.from({ length: 10 }, () => ({
      id: Math.random(),
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 50, // Random X
        1, // Position slightly above ground level
        (Math.random() - 0.5) * 50 // Random Z
      ),
    }))
  );

  return (
    <Physics gravity={[0, -9.8, 0]}>
      <Sky />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      {/* BigFoot as the player */}
      <BigFoot
        modelUrl="https://storage.googleapis.com/new-music/bigfoot2.glb"
        position={[0, 1, 0]} // Slightly above the ground
        scale={[20, 20, 20]}
        rocks={rocks}
        setRocks={setRocks}
        playerControlKeys={{
          up: "w",
          down: "s",
          left: "a",
          right: "d",
          throw: "t",
        }}
      />

      {/* Rocks */}
      <Rocks rocks={rocks} />
<Ground />
      {/* Ground */}
     
    </Physics>
  );
};

const App = () => {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [0, 15, 20], fov: 100 }}>
        <Scene />
        <FPSControls />
      </Canvas>
    </div>
  );
};

export default App;