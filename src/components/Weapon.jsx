import React from "react";
import { useThree } from "@react-three/fiber";
import useSound from "./useSound"; // Import the sound hook
import * as THREE from 'three'

const Weapon = ({ onFire }) => {
  const { camera } = useThree();
  const playGunshotSound = useSound("https://storage.googleapis.com/new-music/GunshotMachineGun_BW.56657.wav");

  const handleFire = () => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const start = camera.position.clone();
    onFire(start, direction);
    playGunshotSound(); // Play the gunshot sound
  };

  // Attach fire event to mouse click
  React.useEffect(() => {
    window.addEventListener("click", handleFire);
    return () => window.removeEventListener("click", handleFire);
  }, [camera]);

  return null; // No visible representation needed
};

export default Weapon;