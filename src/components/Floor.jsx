import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

const Floor = () => {
  const { scene } = useGLTF("https://storage.googleapis.com/new-music/winter_forest.glb");
  
  return (
    <>
      {/* Load the forest GLTF model */}
      <primitive object={scene} position={[0, -0.01, 0]} />
    </>
  );
};

export default Floor;