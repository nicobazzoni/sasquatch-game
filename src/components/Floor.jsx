import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Floor = ({ setFloorBoundary }) => {
  const { scene } = useGLTF("https://storage.googleapis.com/new-music/winter_forest.glb");
  const floorRef = useRef();

  useEffect(() => {
    if (scene && setFloorBoundary) {
      // Calculate the bounding box of the floor model
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Define boundaries based on the size and position of the floor
      const boundary = {
        minX: -size.x / 2,
        maxX: size.x / 2,
        minZ: -size.z / 2,
        maxZ: size.z / 2,
      };

      setFloorBoundary(boundary); // Pass boundaries back to parent
    }
  }, [scene, setFloorBoundary]);

  return (
    <>
      {/* Load the forest GLTF model */}
      <primitive ref={floorRef} object={scene} scale={[2, 2, 2]} position={[0, -0.01, 0]} />
    </>
  );
};

export default Floor;