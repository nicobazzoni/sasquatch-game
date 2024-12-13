import { Cloud } from "@react-three/drei";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const MovingCloud = (props) => {
  const cloudRef = useRef();

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.position.x += props.speed || 0.005; // Adjust speed here
      // Reset position for looping effect
      if (cloudRef.current.position.x > 20) {
        cloudRef.current.position.x = 10;
      }
    }
  });

  return <Cloud ref={cloudRef} {...props} />;
};

export default MovingCloud;