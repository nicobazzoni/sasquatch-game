import { Text } from "@react-three/drei";

const GameOverText = ({ visible }) => {
  if (!visible) return null;
  return (
    <Text
      position={[0, 2, -5]} // Position text in front of the player
      fontSize={1}
      color="red"
      anchorX="center"
      anchorY="middle"
    >
      Game Over
    </Text>
  );
};

export default GameOverText;