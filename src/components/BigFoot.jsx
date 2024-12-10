import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

const BigFoot = ({ url, position, scale, keysPressed }) => {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const handleAnimation = () => {
      if (keysPressed.current["w"]) {
        actions.run?.play();
      } else {
        actions.idle?.play();
      }
    };

    const interval = setInterval(handleAnimation, 100);
    return () => clearInterval(interval);
  }, [actions, keysPressed]);

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("https://storage.googleapis.com/new-music/bigfoot2.glb");

export default BigFoot;