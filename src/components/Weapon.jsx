import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useSound from "./useSound";
import * as THREE from "three";

const MAGAZINE_SIZE = 9;
const RELOAD_DURATION_MS = 1150;
let reloadAudioContext = null;

const playReloadSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  reloadAudioContext ??= new AudioContext();
  const context = reloadAudioContext;
  if (context.state === "suspended") context.resume();
  const now = context.currentTime;

  const playClick = (startTime, frequency, duration, volume) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  playClick(now, 180, 0.06, 0.08);
  playClick(now + 0.18, 520, 0.045, 0.05);
  playClick(now + 0.42, 260, 0.07, 0.075);

};

const Weapon = ({ onFire, onReloadComplete }) => {
  const { camera, scene } = useThree();
  const weaponRef = useRef();
  const mixerRef = useRef();
  const shotCountRef = useRef(0);
  const isReloadingRef = useRef(false);
  const reloadTimeoutRef = useRef(null);
  const onFireRef = useRef(onFire);
  const onReloadCompleteRef = useRef(onReloadComplete);
  const { scene: weaponModel, animations } = useGLTF(
    "https://storage.googleapis.com/new-music/c7_prototype_pistol.glb",
  );

  const playGunshotSound = useSound(
    "https://storage.googleapis.com/new-music/GunshotMachineGun_BW.56657.wav",
    false,
    0.65,
    { poolSize: 4 },
  );

  useEffect(() => {
    onFireRef.current = onFire;
    onReloadCompleteRef.current = onReloadComplete;
  }, [onFire, onReloadComplete]);

  const finishReload = () => {
    shotCountRef.current = 0;
    isReloadingRef.current = false;
    onReloadCompleteRef.current?.();
  };

  const startReload = () => {
    if (isReloadingRef.current) return;

    playReloadSound();
    isReloadingRef.current = true;

    const reloadAnimation = animations?.find((clip) => clip.name === "test");

    if (reloadAnimation && mixerRef.current) {
      const action = mixerRef.current.clipAction(reloadAnimation);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.reset().play();

      const onAnimationFinish = (event) => {
        if (event.action === action) {
          finishReload();
          mixerRef.current.removeEventListener("finished", onAnimationFinish);
        }
      };

      mixerRef.current.addEventListener("finished", onAnimationFinish);
      return;
    }

    reloadTimeoutRef.current = window.setTimeout(finishReload, RELOAD_DURATION_MS);
  };

  const handleFire = () => {
    if (isReloadingRef.current) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const start = camera.position
      .clone()
      .add(direction.clone().multiplyScalar(0.35));

    onFireRef.current?.(start, direction);
    playGunshotSound({ restart: true });

    shotCountRef.current += 1;

    if (shotCountRef.current >= MAGAZINE_SIZE) {
      startReload();
    }
  };

  useEffect(() => {
    camera.add(weaponModel);
    scene.add(camera);
    weaponRef.current = weaponModel;

    if (animations && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(weaponModel);
    }

    weaponModel.scale.set(0.010, 0.010, 0.010);
    weaponModel.position.set(0.2, -0.2, -1);
    weaponModel.rotation.set(0, Math.PI, 0);

    window.addEventListener("click", handleFire);

    return () => {
      if (reloadTimeoutRef.current) window.clearTimeout(reloadTimeoutRef.current);
      window.removeEventListener("click", handleFire);
      camera.remove(weaponModel);
    };
  }, [camera, weaponModel, scene, animations]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return null;
};

export default Weapon;
