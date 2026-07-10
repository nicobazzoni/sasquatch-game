import { useRef, useEffect } from "react";

const useSound = (url, loopOrVolume = false, volume = 0.5) => {
  const audioRef = useRef(new Audio(url));

  const loop = typeof loopOrVolume === "boolean" ? loopOrVolume : false;
  const resolvedVolume =
    typeof loopOrVolume === "number" ? loopOrVolume : volume;

  useEffect(() => {
    audioRef.current.loop = loop;
    audioRef.current.volume = resolvedVolume;
  }, [url, loop, resolvedVolume]);

  const playSound = ({ restart = false } = {}) => {
    if (restart) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .catch((err) => console.error("Failed to play sound:", err));
    }
  };

  const stopSound = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  return playSound;
};

export default useSound;
