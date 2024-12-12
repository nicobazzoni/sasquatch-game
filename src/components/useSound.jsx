import { useRef, useEffect } from "react";

const useSound = (url) => {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(url); // Create a new Audio instance
  }, [url]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to the start
      audioRef.current.play(); // Play the sound
    }
  };

  return playSound;
};

export default useSound;