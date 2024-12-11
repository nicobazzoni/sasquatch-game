import { usePlane } from "@react-three/cannon";

const Ground = () => {


  return (
    <mesh >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

export default Ground;