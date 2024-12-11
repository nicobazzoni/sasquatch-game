import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useKeyboard from "./CharacterControls";

const BigFoot = ({ modelUrl, position, scale, rocks, setRocks }) => {
  const bigFootRef = useRef();
  const mixer = useRef();
  const actions = useRef({});
  const currentAction = useRef("idle");
  const carryingRock = useRef(null);

  const { scene, animations } = useGLTF(modelUrl);
  const keyboardActions = useKeyboard();

  useEffect(() => {
    if (scene) {
      bigFootRef.current = scene;
      bigFootRef.current.position.set(...position);
      bigFootRef.current.scale.set(...scale);

      // Initialize animations
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        actions.current[clip.name] = mixer.current.clipAction(clip);
      });

      // Default to idle animation
      actions.current["idle"]?.play();
    }
  }, [scene, animations, position, scale]);

  const throwRock = () => {
    if (!carryingRock.current) {
      console.log("Throwing rock!");

      const throwAction = actions.current["throw"];
      throwAction?.reset().fadeIn(0.1).play();

      // Simulate rock throw (e.g., spawn a rock)
      setTimeout(() => {
        const thrownRock = {
          id: Date.now(),
          position: bigFootRef.current.position.clone(),
          velocity: bigFootRef.current
            .getWorldDirection(new THREE.Vector3())
            .multiplyScalar(5),
        };
        setRocks((prevRocks) => [...prevRocks, thrownRock]);

        carryingRock.current = false;
      }, 500); // Delay for realism
    }
  };

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const moveVector = new THREE.Vector3();
    let newAction = "idle";

    // Handle movement
    if (keyboardActions.moveForward) {
      moveVector.z -= 0.1;
      newAction = "walk";
    }
    if (keyboardActions.moveBackward) {
      moveVector.z += 0.1;
      newAction = "walk";
    }
    if (keyboardActions.moveLeft) {
      bigFootRef.current.rotation.y += 0.05;
    }
    if (keyboardActions.moveRight) {
      bigFootRef.current.rotation.y -= 0.05;
    }
    if (keyboardActions.space) {
      newAction = "throw";
      throwRock();
    }

    // Update BigFoot's position
    if (bigFootRef.current) {
      bigFootRef.current.translateZ(moveVector.z);
    }

    // Handle animation transitions
    if (newAction !== currentAction.current) {
      actions.current[currentAction.current]?.fadeOut(0.2);
      actions.current[newAction]?.reset().fadeIn(0.2).play();
      currentAction.current = newAction;
    }
  });

  return <primitive ref={bigFootRef} object={scene} />;
};

export default BigFoot;