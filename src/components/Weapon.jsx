import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useSound from "./useSound"; // Import the sound hook
import * as THREE from "three";

const Weapon = ({ onFire }) => {
  const { camera, scene, animation } = useThree();
  const weaponRef = useRef();

  const { scene: weaponModel } = useGLTF("https://storage.googleapis.com/new-music/c7_prototype_pistol.glb");

  const playGunshotSound = useSound("https://storage.googleapis.com/new-music/GunshotMachineGun_BW.56657.wav");

  const handleFire = () => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Get the weapon's position as the bullet start point
    const start = weaponRef.current ? weaponRef.current.getWorldPosition(new THREE.Vector3()) : camera.position.clone();

    onFire(start, direction);
    playGunshotSound(); // Play the gunshot sound
  };

  useEffect(() => {
    // Attach the weapon model to the camera
    camera.add(weaponModel);
    scene.add(camera); // Ensure the camera and weapon are part of the scene
    weaponRef.current = weaponModel;
    weaponModel.scale.set(0.010, 0.010, 0.010); // Scale down the weapon to half its size

    // Attach fire event to mouse click
    window.addEventListener("click", handleFire);
    return () => {
      window.removeEventListener("click", handleFire);
      camera.remove(weaponModel); // Clean up on unmount
    };
  }, [camera, weaponModel]);

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