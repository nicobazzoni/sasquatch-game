import React from "react";
import { useSphere } from "@react-three/cannon";

const Rocks = ({ rocks }) => {
  return (
    <>
      {rocks.map((rock) => (
        <Rock key={rock.id} position={rock.position.toArray()} />
      ))}
    </>
  );
};

const Rock = ({ position }) => {
  const [ref] = useSphere(() => ({
    mass: 1, // Add mass for physics
    position: position, // Initialize position
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} /> {/* Adjust size */}
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

export default Rocks;