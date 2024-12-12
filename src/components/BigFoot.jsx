import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const BigFoot = ({ modelUrl, position, scale, onHit }) => {
  const bigFootRef = useRef();
  const mixer = useRef();
  const actions = useRef({});
  const keysPressed = useRef({});
  const currentAction = useRef("idle");

  const { scene, animations } = useGLTF(modelUrl);

  useEffect(() => {
    if (scene) {
      bigFootRef.current = scene;
      bigFootRef.current.position.set(...position);
      bigFootRef.current.scale.set(...scale);

      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        actions.current[clip.name] = mixer.current.clipAction(clip);
      });

      actions.current["idle"]?.play();
    }

    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [scene, animations, position, scale]);

  const updateAnimation = (newAction) => {
    if (newAction !== currentAction.current) {
      actions.current[currentAction.current]?.fadeOut(0.2);
      actions.current[newAction]?.reset().fadeIn(0.2).play();
      currentAction.current = newAction;
    }
  };

  const checkLaserCollision = (lasers) => {
    if (!bigFootRef.current) return;

    const bigFootBox = new THREE.Box3().setFromObject(bigFootRef.current);

    lasers.forEach((laser) => {
      const laserBox = new THREE.Box3().setFromObject(laser);

      if (bigFootBox.intersectsBox(laserBox)) {
        console.log("BigFoot hit by laser!");
        onHit(); // Notify parent
      }
    });
  };

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);

    const moveVector = new THREE.Vector3();
    let newAction = "idle";

    // Handle movement
    if (keysPressed.current["KeyW"]) {
      moveVector.z -= 0.1;
      newAction = "walk";
    }
    if (keysPressed.current["KeyS"]) {
      moveVector.z += 0.1;
      newAction = "walk";
    }
    if (keysPressed.current["KeyA"]) {
      bigFootRef.current.rotation.y += 0.05;
    }
    if (keysPressed.current["KeyD"]) {
      bigFootRef.current.rotation.y -= 0.05;
    }

    bigFootRef.current.translateZ(moveVector.z);
    updateAnimation(newAction);

    // Check for laser collisions
    const lasers = state.scene.children.filter((obj) => obj.name === "Laser");
    checkLaserCollision(lasers);
  });

  return <primitive ref={bigFootRef} object={scene} />;
};

export default BigFoot;