import { Text, Html } from "@react-three/drei";

const GameOverText = ({ visible, onReset }) => {
  if (!visible) return null;

  return (
    <>
      {/* Game Over Text */}
      <Text
        position={[0, 2, -5]} // Adjust to your scene
        fontSize={1}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        Game Over
      </Text>

      {/* Reset Button */}
      <Html
        position={[0, 0, -5]} // Aligns with Game Over text
        center
        pointerEvents // Enables interaction
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background for clarity
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <button
            onClick={onReset}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              color: "white",
              backgroundColor: "blue",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reset Game
          </button>
        </div>
      </Html>
    </>
  );
};

export default GameOverText;