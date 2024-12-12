import { Physics, useBox } from "@react-three/cannon";

const PhysicsEngine = ({ children }) => {
  return <Physics gravity={[0, -9.8, 0]}>{children}</Physics>;
};

export default PhysicsEngine;