import React, { useRef, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useSound from "./useSound";
import * as THREE from "three";

import { useFrame } from "@react-three/fiber";

const Weapon = ({ onFire }) => {
  const { camera, scene } = useThree();
  const weaponRef = useRef();
  const mixerRef = useRef(); // Reference for the AnimationMixer
  const shotCountRef = useRef(0); // Track the number of shots
  const [hasPlayedAnimation, setHasPlayedAnimation] = useState(false); // Prevent multiple plays
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const { scene: weaponModel, animations } = useGLTF(
    "https://storage.googleapis.com/new-music/c7_prototype_pistol.glb"
  );

  const playGunshotSound = useSound(
    "https://storage.googleapis.com/new-music/GunshotMachineGun_BW.56657.wav"
  );

  const handleFire = () => {
    if (isAnimationPlaying) return; // Prevent firing during animation
  
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
  
    const start = weaponRef.current
      ? weaponRef.current.getWorldPosition(new THREE.Vector3())
      : camera.position.clone();
  
    onFire(start, direction);
    playGunshotSound();
  
    shotCountRef.current += 1;
    console.log(`Shots fired: ${shotCountRef.current}`);
  
    if (shotCountRef.current === 9) {

  
      if (animations && animations.length > 0) {
        const testAnimation = animations.find((clip) => clip.name === "test");
  
        if (testAnimation) {
          console.log("Playing 'test' weapon animation after 9 shots:", testAnimation.name);
  
          const action = mixerRef.current.clipAction(testAnimation);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.reset().play();
  
          setIsAnimationPlaying(true); // Lock firing during animation
  
          const onAnimationFinish = (event) => {
            if (event.action === action) {
              shotCountRef.current = 0; // Reset the shot count
              console.log("Resetting shot count after animation finishes.");
              setIsAnimationPlaying(false); // Unlock firing
              mixerRef.current.removeEventListener("finished", onAnimationFinish);
            }
          };
  
          mixerRef.current.addEventListener("finished", onAnimationFinish);
        } else {
          console.log("No animation named 'test' found.");
        }
      }
    }
  };

  useEffect(() => {
    // Attach the weapon model to the camera
    camera.add(weaponModel);
    scene.add(camera); // Ensure the camera and weapon are part of the scene
    weaponRef.current = weaponModel;

    // Initialize the AnimationMixer
    if (animations && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(weaponModel);
    }

    weaponModel.scale.set(0.010, 0.010, 0.010); // Scale down the weapon

    // Attach fire event to mouse click
    window.addEventListener("click", handleFire);

    // Log available animations
    if (animations && animations.length > 0) {
      console.log("Weapon Animations Available:", animations.map((clip) => clip.name));
    } else {
      console.log("No animations found for the weapon.");
    }

    return () => {
      window.removeEventListener("click", handleFire);
      camera.remove(weaponModel); // Clean up on unmount
    };
  }, [camera, weaponModel, scene, animations]);

  // Update AnimationMixer on each frame
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  // Position the weapon relative to the camera
  useEffect(() => {
    if (weaponRef.current) {
      weaponRef.current.position.set(0.2, -0.2, -1); // Adjust these values for weapon placement
      weaponRef.current.rotation.set(0, Math.PI, 0); // Face forward
    }
  }, [weaponRef]);

  return null; // No visible representation needed
};

export default Weapon;