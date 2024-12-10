import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

const BigFoot = ({ url, position, scale, action }) => {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);
  console.log()

  useEffect(() => {
    if (actions && action) {
        console.log(actions)
      // Play the selected animation
      Object.keys(actions).forEach((key) => {
        if (key === action) {
          actions[key].reset().fadeIn(0.5).play();
        } else {
          actions[key].fadeOut(0.5);
        }
      });
    }
  }, [action, actions]);

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} scale={[2, 2, 2]} // Adjust the size
             />
    </group>
  );
};

useGLTF.preload("https://storage.googleapis.com/new-music/bigfoot2.glb");

export default BigFoot;