
import { useRef, useEffect} from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three'
const Avatar = ({ position, attackPosition }) => {
    const avatarRef = useRef();
    const { scene, animations } = useGLTF("https://storage.googleapis.com/new-music/ultimate_monsters_pack.glb");
    const mixer = useRef(null);
    const actions = useRef({});
    const visionRadius = 10; // Distance within which Avatar reacts
  
    useEffect(() => {
        if (scene && animations) {
          avatarRef.current = scene;
          avatarRef.current.position.set(...position);
          avatarRef.current.scale.set(1.5, 1.5, 1.5); // Adjust scale if needed
          mixer.current = new THREE.AnimationMixer(scene);
      
          // Log available animations
          console.log("Available animations:", animations.map((clip) => clip.name));
      
          animations.forEach((clip) => {
            actions.current[clip.name] = mixer.current.clipAction(clip);
          });
      
          // Play default idle animation
          if (actions.current["Take 01"]) {
            actions.current["Take 01"].play();
          } else {
            console.error("Idle animation not found. Available actions:", Object.keys(actions.current));
          }
        }
      }, [scene, animations, position]);
  
    // Move Avatar autonomously
    useFrame((_, delta) => {
      if (avatarRef.current && mixer.current) {
        mixer.current.update(delta);
  
        // Example patrol logic: Move in a circle
        const time = Date.now() * 0.001;
        avatarRef.current.position.x = position[0] + Math.sin(time) * 5;
        avatarRef.current.position.z = position[2] + Math.cos(time) * 5;
      }
  
      // Check if Avatar should react to an attack
      if (attackPosition && avatarRef.current) {
        const distance = avatarRef.current.position.distanceTo(attackPosition);
        if (distance < visionRadius) {
          // Trigger "die" animation
          actions.current["Take 01"]?.fadeOut(0.5);
          actions.current["die"]?.reset().fadeIn(0.5).play();
        }
      }
    });
  
    return <primitive ref={avatarRef} object={scene} />;
  };

  export default Avatar 