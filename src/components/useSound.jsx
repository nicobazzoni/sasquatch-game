import { useRef, useEffect } from "react";

const useSound = (url, volume = 1.0) => {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(url);

    // Set the initial volume
    audioRef.current.volume = Math.min(Math.max(volume, 0.0), 1.0);

    // Reset playback state when the audio ends
    audioRef.current.addEventListener("ended", () => {
      audioRef.current.currentTime = 0;
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Cleanup on unmount
      }
    };
  }, [url, volume]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to the start
      audioRef.current
        .play()
        .catch((error) => console.error("Failed to play sound:", error));
    }
  };

  return playSound;
};

export default useSound;