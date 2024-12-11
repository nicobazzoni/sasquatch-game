import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { usePlane } from "@react-three/cannon";

const Ground = () => {
  const { scene } = useGLTF("https://storage.googleapis.com/new-music/rock_terrain_3.glb"); // Load the GLB terrain
  const [ref] = usePlane(() => ({
    type: "Static", // Static physics body
    rotation: [-Math.PI / 2, 0, 0], // Rotate plane to be flat
  }));

  return (
    <group>
      {/* Static physics plane for collision */}
      <mesh ref={ref} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Render the GLB terrain */}
      <primitive object={scene} scale={[7, 7, 7]} position={[0, -30, 0]} />
    </group>
  );
};

export default Ground;