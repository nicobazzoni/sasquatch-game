import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Avatar = ({ characterName, position }) => {
  const avatarRef = useRef();
  const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/ultimate_monsters_pack.glb");
  const mixer = useRef(null);
  const actions = useRef({});
  const visionRadius = 10;

  useEffect(() => {
    if (scene) {
      // Log the scene hierarchy for debugging
      console.log("GLTF Scene Hierarchy:");
      scene.traverse((child) => {
        console.log("Object Name:", child.name, "| Type:", child.type);
      });

      // Find the specified character by name or partial match
      const character = scene.getObjectByName(characterName) || scene.children.find((child) => child.name.includes(characterName));

      if (character) {
        avatarRef.current = character;
        avatarRef.current.position.set(...position);
        avatarRef.current.scale.set(3.5, 3.5, 3.5);

        // Setup animation mixer
        mixer.current = new THREE.AnimationMixer(character);

        animations.forEach((clip) => {
          const targetName = clip.tracks[0]?.name.split(".")[0]; // Extract target node name
          const targetNode = character.getObjectByName(targetName) || character; // Fallback to character if node not found

          if (targetNode) {
            actions.current[clip.name] = mixer.current.clipAction(clip, targetNode);
          } else {
            console.warn(`Target node ${targetName} not found for animation ${clip.name}`);
          }
        });

        // Play default idle animation
        actions.current["Take 01"]?.play();
      } else {
        console.error(`Character ${characterName} not found`);
      }
    }
  }, [scene, animations, characterName, position]);

  useEffect(() => {
    return () => {
      if (mixer.current) mixer.current.stopAllAction(); // Cleanup actions
    };
  }, []);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);

    // Simple random movement logic for the Avatar
    if (avatarRef.current) {
      avatarRef.current.position.x += (Math.random() - 0.5) * 0.05;
      avatarRef.current.position.z += (Math.random() - 0.5) * 0.05;

      // Keep within bounds
      avatarRef.current.position.x = THREE.MathUtils.clamp(avatarRef.current.position.x, position[0] - 10, position[0] + 10);
      avatarRef.current.position.z = THREE.MathUtils.clamp(avatarRef.current.position.z, position[2] - 10, position[2] + 10);
    }
  });

  return avatarRef.current ? <primitive object={avatarRef.current} /> : null;
};

export default Avatar;