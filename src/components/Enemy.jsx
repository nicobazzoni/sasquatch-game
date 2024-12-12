import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Enemy = ({ id, position, setBoundingBox }) => {
  const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/bigfoot2.glb");
  const ref = useRef();
  const mixer = useRef();
  const boundingBox = useRef(new THREE.Box3());

  useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);

      // Play the first animation and set it to loop
      const action = mixer.current.clipAction(animations[0]);
      action.setLoop(THREE.LoopRepeat); // Make animation loop
      action.play();
    }
  }, [animations, scene]);

  useEffect(() => {
    // Set the bounding box for collision detection
    if (ref.current) {
      boundingBox.current.setFromObject(ref.current);
      if (setBoundingBox) setBoundingBox(boundingBox.current);
    }
  }, [ref, setBoundingBox]);

  useFrame((_, delta) => {
    // Update the animation mixer
    if (mixer.current) mixer.current.update(delta);

    // Update the bounding box position
    if (ref.current) {
      boundingBox.current.setFromObject(ref.current);
      if (setBoundingBox) setBoundingBox(boundingBox.current);
    }
  });

  return <primitive ref={ref} object={scene} position={position} />;
};

export default Enemy;