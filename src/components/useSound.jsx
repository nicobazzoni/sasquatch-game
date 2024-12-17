import { useRef, useEffect } from "react";

const useSound = (url, loop = false, volume = 0.5) => {
  const audioRef = useRef(new Audio(url));

  useEffect(() => {
    audioRef.current.loop = loop; // Enable looping if needed
    audioRef.current.volume = volume; // Set volume
  }, [url, loop, volume]);

  const playSound = () => {
    if (audioRef.current.paused) {
      audioRef.current.play().catch((err) => console.error("Failed to play sound:", err));
    }
  };

  return playSound;
};

export default useSound;