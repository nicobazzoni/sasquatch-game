import { useCallback, useEffect, useRef } from "react";

const useSound = (
  url,
  loopOrVolume = false,
  volume = 0.5,
  { poolSize = 1 } = {},
) => {
  const audioPoolRef = useRef([]);
  const nextVoiceRef = useRef(0);

  const loop = typeof loopOrVolume === "boolean" ? loopOrVolume : false;
  const resolvedVolume =
    typeof loopOrVolume === "number" ? loopOrVolume : volume;

  useEffect(() => {
    const voiceCount = loop ? 1 : Math.max(1, poolSize);
    const audioPool = Array.from({ length: voiceCount }, () => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = url;
      audio.loop = loop;
      audio.volume = resolvedVolume;
      audio.load();
      return audio;
    });

    audioPoolRef.current = audioPool;
    nextVoiceRef.current = 0;

    return () => {
      audioPool.forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
      audioPoolRef.current = [];
    };
  }, [url, loop, resolvedVolume, poolSize]);

  const playSound = useCallback(({ restart = false } = {}) => {
    const audioPool = audioPoolRef.current;
    if (audioPool.length === 0) return;

    let audio = audioPool.find((voice) => voice.paused || voice.ended);

    if (!audio) {
      audio = audioPool[nextVoiceRef.current];
      nextVoiceRef.current = (nextVoiceRef.current + 1) % audioPool.length;
    }

    if (restart) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (audio.paused) {
      audio
        .play()
        .catch((err) => console.error("Failed to play sound:", err));
    }
  }, []);

  return playSound;
};

export default useSound;
