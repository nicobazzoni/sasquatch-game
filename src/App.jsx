import React from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Scene from "./components/Scene";
import { GridHelper } from "three";
import Floor from "./components/Floor";


const App = () => {
  return ( 
   
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />

      {/* Game Scene */}
      <Scene />
      <Floor />
     
      {/* Controls */}
      <PointerLockControls />
    </Canvas>
  );
};

export default App;