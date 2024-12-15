import React, { useEffect } from "react";
import useSound from "use-sound"; // Correct external import

const BackgroundMusic = () => {
  const [play, { stop }] = useSound(
    "https://storage.googleapis.com/new-music/Synths_Loops_5_DarkCorridorsFullMix82_Am.wav",
    {
      loop: true, // Enable looping
      volume: 0.5, // Adjust volume (optional)
    }
  );

  useEffect(() => {
    play(); // Start playing on load

    return () => {
      stop(); // Stop playing when component unmounts
    };
  }, [play, stop]);

  return null; // No visible UI required
};

export default BackgroundMusic;