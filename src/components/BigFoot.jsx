import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const BigFoot = ({ position, scale, camera }) => {
  const bigFootRef = useRef();
  const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/bigfoot2.glb");
  const { actions } = useAnimations(animations, bigFootRef);
  const keysPressed = useRef({}); // Tracks keypresses for movement
  const currentAction = useRef("idle");

  useEffect(() => {
    if (bigFootRef.current) {
      bigFootRef.current.position.set(...position);
      bigFootRef.current.scale.set(...scale);

      // Start with idle animation
      actions.idle?.play();
    }

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
  }, [actions, position, scale]);

  useFrame((_, delta) => {
    if (!bigFootRef.current) return;

    const moveVector = new THREE.Vector3();
    let newAction = "idle"; // Default animation is idle

    // Movement and rotation logic
    if (keysPressed.current["arrowup"]) {
      moveVector.z -= 0.1; // Move forward
      newAction = "walk";
    }
    if (keysPressed.current["arrowdown"]) {
      moveVector.z += 0.1; // Move backward
      newAction = "walk";
    }
    if (keysPressed.current["arrowleft"]) {
      bigFootRef.current.rotation.y += 0.05; // Rotate left
    }
    if (keysPressed.current["arrowright"]) {
      bigFootRef.current.rotation.y -= 0.05; // Rotate right
    }
    if (keysPressed.current["t"]) {
        newAction = "throw"; // Rotate right
      }
    

    // Apply movement
    bigFootRef.current.translateZ(moveVector.z);

    // Handle animation switching
    if (actions && newAction !== currentAction.current) {
      actions[currentAction.current]?.fadeOut(0.2);
      actions[newAction]?.reset().fadeIn(0.2).play();
      currentAction.current = newAction;
    }

    // Make camera follow BigFoot
    if (camera) {
      const offset = new THREE.Vector3(0, 2, -5); // Adjust camera position behind BigFoot
      const target = bigFootRef.current.position.clone();
      camera.position.copy(target.add(offset));
      camera.lookAt(bigFootRef.current.position);
    }
  });

  return <primitive ref={bigFootRef} object={scene} />;
};

export default BigFoot;