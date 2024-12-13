import { Physics, useBox } from "@react-three/cannon";

const PhysicsEngine = ({ children }) => {
  return <Physics gravity={[0, 0, 0]}>{children}</Physics>;
};

export default PhysicsEngine;